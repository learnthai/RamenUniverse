import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, RamenCard } from './types';
import explicitVisits from './new_visits.json';
import { MRT } from './constants';
import { auth, db } from './firebase';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

const SK = 'ramen_desu_v4';

const defaultState: AppState = {
  wish: [],
  visited: [],
  styles: ['橫濱家系', '二郎', '泡系', '沾麵', '魚介', '淡麗', '海鮮', '煮干'],
  seasons: ['豚骨', '鹽味', '味增', '醬油', '雞白湯', '牛骨白湯', '雞清湯', '鴨白湯']
};

export function normalizeCard(c: RamenCard): RamenCard {
// ... keep existing normalizations, just copying exact lines except the top stuff

  const STYLES = ['橫濱家系', '二郎', '泡系', '沾麵', '魚介', '淡麗', '海鮮', '煮干'];
  const SEASONS = ['豚骨', '鹽味', '味增', '醬油', '雞白湯', '牛骨白湯', '雞清湯', '鴨白湯'];

  const norm = (s: string | undefined) => {
    if (!s) return '';
    let val = s.trim();
    if (val.includes('雞白')) return '雞白湯';
    if (val.includes('牛骨')) return '牛骨白湯';
    if (val.includes('味增') || val.includes('味噌')) return '味增';
    if (val === '家系' || val.includes('橫濱家系')) return '橫濱家系';
    if (val.includes('海鮮')) return '海鮮';
    if (val.includes('魚介')) return '魚介';
    if (val.includes('淡麗')) return '淡麗';
    if (val.includes('煮干')) return '煮干';
    if (val.includes('醬油')) return '醬油';
    if (val.includes('豚骨')) return '豚骨';
    if (val.includes('鹽味')) return '鹽味';
    return val;
  };

  const normMrt = (s: string | undefined) => {
    if (!s) return '';
    let val = s.trim().replace(/站$/, '');
    if (val === '民權溪' || val === '民權西') return '民權西路';
    if (val === '國館') return '國父紀念館';
    if (val === '北車') return '台北車站';
    if (val === '敦化') return '忠孝敦化';
    if (val === '復興') return '忠孝復興';
    if (val === '南京') return '南京復興';
    if (val === '新埔民生') return '新埔';
    
    // Check if valid
    const allStas = MRT.flatMap(line => line.stas);
    if (!allStas.includes(val)) return '';
    return val;
  };

  const classify = (styleIn: string | undefined, seasonIn: string | undefined) => {
    let s = norm(styleIn);
    let sea = norm(seasonIn);
    
    let finalStyle = '';
    let finalSeason = '';

    [s, sea].forEach(v => {
      if (STYLES.includes(v)) finalStyle = v;
      if (SEASONS.includes(v)) finalSeason = v;
    });

    return { style: finalStyle, season: finalSeason };
  };

  const { style, season } = classify(c.style, c.season);
  const station = normMrt(c.station);
  
  return {
    ...c,
    style,
    season,
    station,
    visits: (c.visits || []).map(v => {
      const vClass = classify(v.style, v.season);
      return {
        ...v,
        style: vClass.style || style,
        season: vClass.season || season
      };
    })
  };
}

const DUMMY_RAW = `✓ ⚡貝系湯底 /墨洋 (極上貝貝)  →公館站 叉燒飯讚 湯鮮甜👍🏾👍🏾
 ✓ ⚡豚骨湯底 / 真劍 (豚骨拉麵) →台電大樓站 👍🏾👍🏾
 ✓ ⚡雞白湯底 / Soba Shinn & 柑橘 (柑橘蛤蜊雞白湯 濃厚) →敦化or 信義安和中間 👍🏾👍🏾👍🏾👍🏾
 ✓ ⚡泡系湯底 / 麵屋壹慶 (豚骨鹽味) →中山國小站👍🏾👍🏾👍🏾
 ◦ ⚡鹽味湯底 / 創作拉麵 悠然 (每周不一樣 虱目魚雞湯 清爽) →中山國小站
 ✓ ⚡味噌湯底 / 鬼金棒 →中山站
 ✓ ⚡煮干系 / 麵屋壹之穴 (豚骨煮干拉麵 hen濃 偏鹹) →國父紀念館站🤏🏾
 ✓ ⚡濃湯系 / 鷹流東京拉麵 
 ◦ 橫濱家系 / 中山大和家 (631拉麵) → 中山
 ◦ 二郎 / 雞二 → 信義安和
 ✓ 柑橘/煮干/ 隱日→ 板橋👍🏾👍🏾👍🏾
 ✓ 鹽味/塩琉拉麵（干貝龍蝦清湯）→ 北車👍🏾👍🏾
 ✓ 豚骨白湯/山嵐 👍🏾👍🏾👍🏾
 ✓ 魚介豚骨/山嵐（海湯豐盛）👍🏾👍🏾👍🏾
 ✓ 牡蠣/二屋→👍🏾 可嘗試一次
 ◦ 煮干/麵屋敬太→淡水
 ✓ 泡系/旨燕→西門 👍🏾
 ✓ 煮干/拉麵公子→ 南京復興 👍🏾👍🏾
 ✓ 數劇屋（雞白湯）→台電大樓👍🏾👍🏾👍🏾
 ✓ 双豚/→ 新埔民生 👍🏾👍🏾
 ✓ 海鮮白湯/湮鯱（黑雕濃湯）→ 忠孝復興 👍🏾👍🏾👍🏾
 ◦ 泡系 鴨白湯 / 蒝山 → 大安
 ✓ 五之神製作所→市政府 👍🏾👍🏾
 ✓ 鹽貝雞、豚骨/丸舢→忠孝新生
       鹽：👍🏾 👍🏾
 ✓ 鴨白湯/麵屋辰吉→ 士林 👍🏾👍🏾
 ✓ 麒麟拉麵→ 中山 👍🏾👍🏾
 ✓ 泡系豚骨/諭吉→中山👍🏾👍🏾
 ✓ 泡系/麵屋鴒→板橋👍🏾👍🏾
 ✓ 醬油.豚骨.鹽味/丸宗→三重 👍🏾👍🏾👍🏾
 ✓ 辣味增（赤辛牛骨白湯）/誠屋→雙連👍🏾👍🏾👍🏾
 ✓ 雞白湯/麵屋武藏→本店（北車）👍🏾👍🏾
 ✓ /富山天滿→大橋頭👍🏾👍🏾
 ✓ Eno ramen →大安👍🏾👍🏾
 ✓ 柚香雞白湯/天鷄麵屋坊→中山👍🏾👍🏾👍🏾👍🏾
 ◦ 雞白湯 / 麺魚堺 → 中山
 ✓ 龍蝦海膽/塩琉（林森店）→中山👍🏾👍🏾👍🏾👍🏾
 ✓ 醬油豚骨/豚小屋→輔大👍🏾👍🏾👍🏾
 ✓ 雞白湯/吉天元→西門👍🏾👍🏾👍🏾
 ◦ 雞白湯/麵屋昕家→內湖
 ✓ 雞白湯/銀座篝→中山國小👍🏾👍🏾
 ✓ 魚.蝦湯/麵屋有漁→西門👍🏾👍🏾👍🏾
 ✓ 味增雞白湯加辣/麵屋倫太郎→新莊👍🏾👍🏾
 ◦ 雞白湯/麵屋一貴→林口
 ◦ 蝦雲吞雞湯 / 座位有限 → 信義安和
 ✓ 桂花鹽味.海膽雞白/龍麟→中山👍🏾
 ✓ 重口味/梨橙（水豚）→敦化👍🏾👍🏾
 ✓ 乾面/東京油組→中山👍🏾👍🏾👍🏾
 ✓ 茶拉麵/茶悟拉麵→中山👍🏾
 ✓ 鹽味.限定/chill ramen →中山👍🏾👍🏾
 ◦ 雞白湯 / 北海道拉麺 魚貝と鶏 → 忠孝敦化
 ✓ 牛骨白湯/恉霜拉麵→松江南京👍🏾👍🏾👍🏾
 ✓ 辛豚骨/荷麵亭→士林👍🏾👍🏾
 ◦ 隣tonari →忠孝敦化
 ✓ 鹽味蛤蜊雞白/炊煙拉麵→三重國小👍🏾👍🏾
 ◦ 龍人→忠孝敦化
 ◦ 你回來啦→國館
 ✓ 雞湯/麵屋鶴立→中山👍🏾👍🏾
 ◦ 豚骨辣麵/豪鬼→蘆洲
 ◦ 柳町家→蘆洲
 ◦ 辰拉麵→頂溪 （中午-5PM)
 ✓ 麵屋雞金→忠孝敦化 👍🏾👍🏾
 ◦ 酸辣拉麵+香菜 / 鈞拉麵 → 新埔
 ◦ 豚骨 / 吉光食堂 → 景平
 ◦ 煮干 / 仁王家 → 雙連
 ✓ 麵魚.滿雞軒→雙連 👍🏾👍🏾👍🏾`;

function parseMigrationData() {
  const wishes: any[] = [];
  const visits: any[] = [];
  const lines = DUMMY_RAW.split('\n');
  const genId = () => Math.random().toString(36).substring(2, 9);
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('鹽：')) continue;
    
    let isVis = line.startsWith('✓');
    let isWish = line.startsWith('◦');
    if (!isVis && !isWish) continue;
    
    line = line.replace(/^[✓◦]\s*/, '').replace(/⚡/g, '').replace(/️/g, '').trim();
    const starMatch = line.match(/👍🏾/g);
    let rating = starMatch ? starMatch.length : 0;
    line = line.replace(/👍🏾/g, '').trim();
    
    let shop = '';
    let style = '拉麵'; // Default
    let station = '';
    let item = '';
    let comment = '';
    
    // 1. Extract station (→)
    if (line.includes('→')) {
      let parts = line.split('→');
      station = parts[1].trim();
      line = parts[0].trim();
    }
    
    // 2. Extract item (brackets)
    let itMatch = line.match(/\((.*?)\)/);
    if (itMatch) {
      item = itMatch[1].trim();
      line = line.replace(/\(.*\)/, '').trim();
    }

    // 3. Extract style (/)
    if (line.includes('/')) {
      let parts = line.split('/');
      style = parts[0].replace('湯底', '').replace('系', '').trim();
      shop = parts.slice(1).join('/').trim();
    } else {
      shop = line.trim();
    }
    
    if (!shop) continue;
    
    if (station.includes(' ')) {
      let sp = station.split(' ');
      station = sp[0].trim();
      comment = sp.slice(1).join(' ').trim();
    }
    
    station = station.replace(/站$/, '').trim();
    
    if (shop === '丸舢') {
      comment = '鹽：👍🏾 👍🏾';
      rating = 2;
    }
    
    if (isWish) {
      wishes.push({
        id: genId(), shop, style, 
        station: station || undefined, 
        item: item || undefined, 
        comment: comment || undefined
      });
    } else {
      visits.push({
        id: genId(), shop, style, station: station || undefined,
        visits: [{ id: genId(), item: item || undefined, rating, comment: comment || undefined, style, season: '' }]
      });
    }
  }
  return { wishes, visits };
}

export const useStore = () => {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const remoteUpdateRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('shareId');

    if (shareId) {
      setReadOnly(true);
      const ref = doc(db, 'user_lists', shareId);
      const unsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
           const data = snap.data();
           setState({
             wish: data.wish || [],
             visited: data.visited || [],
             styles: data.styles || defaultState.styles,
             seasons: data.seasons || defaultState.seasons
           });
        }
        setLoaded(true);
      });
      return () => unsub();
    }

    try {
      let currentState = defaultState;
      const d = localStorage.getItem(SK);
      if (d) {
        currentState = JSON.parse(d);
      }
      
      const migrated = localStorage.getItem('migrated_v12_restore_full');
      if (!migrated) {
        // ... (keep the same code block inside)
        const { wishes, visits } = parseMigrationData();
        
        const getScore = (item: any) => {
          let score = 0;
          if (item.comment && item.comment.trim() !== '') score += 50;
          if (item.style && item.style !== '' && item.style !== '拉麵') score += 10;
          if (item.season && item.season !== '') score += 10;
          if (item.station && item.station !== '') score += 5;
          if (item.visits && item.visits.length > 0) {
            score += 100;
            const last = item.visits[item.visits.length - 1];
            if (last.comment && last.comment.trim() !== '') score += 50;
            if (last.rating && last.rating > 0) score += (last.rating * 10);
            if (last.season && last.season !== '') score += 10;
            if (last.item && last.item !== '') score += 10;
          }
          return score;
        };

        const mergeRecovery = (existing: any[], incoming: any[]) => {
          const map = new Map<string, any>();
          const getKey = (item: any) => `${item.shop.trim().toLowerCase()}|${(item.style || '').trim().toLowerCase()}`;

          incoming.forEach(item => {
            map.set(getKey(item), item);
          });
          
          existing.forEach(item => {
            const key = getKey(item);
            const current = map.get(key);
            if (!current || getScore(item) >= getScore(current)) {
              map.set(key, item);
            }
          });
          
          return Array.from(map.values());
        };

        currentState = {
          ...currentState,
          wish: mergeRecovery(currentState.wish, wishes),
          visited: mergeRecovery(currentState.visited, visits),
          styles: currentState.styles && currentState.styles.length > 0 ? currentState.styles : defaultState.styles,
          seasons: currentState.seasons && currentState.seasons.length > 0 ? currentState.seasons : defaultState.seasons
        };
        
        localStorage.setItem('migrated_v12_restore_full', '1');
        localStorage.setItem(SK, JSON.stringify(currentState));
      }
      
      const migrated13 = localStorage.getItem('migrated_v13_explicit');
      if (!migrated13) {
        currentState.visited = (explicitVisits as any).map(normalizeCard);
        currentState.styles = defaultState.styles;
        currentState.seasons = defaultState.seasons;
        localStorage.setItem('migrated_v13_explicit', '1');
        localStorage.setItem(SK, JSON.stringify(currentState));
      }

      const migrated14 = localStorage.getItem('migrated_v14_cleanup_v6');
      if (!migrated14) {
        const updateMapping: Record<string, string> = {
          '真劍': '雞清湯',
          'Soba Shinn & 柑橘': '雞白湯',
          '麵屋壹慶': '豚骨',
          '鬼金棒': '味增'
        };

        const updateData = (list: RamenCard[]) => (list || []).map(c => {
          const normC = normalizeCard(c);
          if (updateMapping[normC.shop]) {
            normC.season = updateMapping[normC.shop];
            if (normC.visits) {
              normC.visits = normC.visits.map(v => ({ ...v, season: updateMapping[normC.shop] }));
            }
          }
          return normC;
        });

        currentState.visited = updateData(currentState.visited);
        currentState.wish = updateData(currentState.wish);
        currentState.styles = defaultState.styles;
        currentState.seasons = defaultState.seasons;
        localStorage.setItem('migrated_v14_cleanup_v6', '1');
        localStorage.setItem(SK, JSON.stringify(currentState));
      }

      const migrated15 = localStorage.getItem('migrated_v15_content_v3');
      if (!migrated15) {
        const toDelete = ['亨星', '麵魚'];
        const updates = [
          { match: '大和家', shop: '中山大和家', item: '631拉麵', style: '橫濱家系', station: '中山' },
          { match: '仁王家', shop: '仁王家', style: '煮干', station: '雙連' },
          { match: '麵魚堺', shop: '麺魚堺', season: '雞白湯', station: '中山' },
          { match: '蒝山', shop: '蒝山', style: '泡系', season: '鴨白湯', station: '大安' },
          { match: '座位有限', shop: '座位有限', item: '蝦雲吞雞湯', season: '雞清湯', station: '信義安和' },
          { match: '北海道拉麵', shop: '北海道拉麺 魚貝と鶏', season: '雞白湯', station: '忠孝敦化' },
          { match: '鈞拉麵', shop: '鈞拉麵', item: '酸辣拉麵+香菜', station: '新埔' },
          { match: '雞二', shop: '雞二', style: '二郎', station: '信義安和' },
          { match: '吉光', shop: '吉光食堂', season: '豚骨', station: '景平' }
        ];

        let wish = [...currentState.wish];
        
        wish = wish.filter(c => {
          if (c.shop.includes('麺魚堺') || c.shop.includes('麵魚堺')) return true;
          return !toDelete.some(d => c.shop === d || c.shop === (d + '拉麵') || (c.shop.includes(d) && !c.shop.includes('堺') && !c.shop.includes('滿雞軒')));
        });

        updates.forEach(upd => {
          let found = wish.find(c => c.shop.includes(upd.match));
          if (found) {
            if (upd.shop) found.shop = upd.shop;
            if (upd.item !== undefined) found.item = upd.item;
            if (upd.style !== undefined) found.style = upd.style;
            if (upd.season !== undefined) found.season = upd.season;
            if (upd.station !== undefined) found.station = upd.station;
          } else {
            wish.push({
              id: Math.random().toString(36).substring(2, 9),
              shop: upd.shop,
              item: upd.item || '',
              style: upd.style || '',
              season: upd.season || '',
              station: upd.station || ''
            });
          }
        });

        currentState.wish = wish.map(normalizeCard);
        localStorage.setItem('migrated_v15_content_v3', '1');
        localStorage.setItem(SK, JSON.stringify(currentState));
      }

      setState(currentState);
    } catch (e) {}
    setLoaded(true);

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user || readOnly) return;
    
    // Sync to FireStore
    const ref = doc(db, 'user_lists', user.uid);
    setIsFirebaseSyncing(true);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.updatedAt && !remoteUpdateRef.current) {
          const freshState: AppState = {
            wish: data.wish || [],
            visited: data.visited || [],
            styles: data.styles || defaultState.styles,
            seasons: data.seasons || defaultState.seasons
          };
          setState(freshState);
          localStorage.setItem(SK, JSON.stringify(freshState));
        }
      } else {
        // Init remote database with local
        const local = localStorage.getItem(SK);
        if (local) {
          const st = JSON.parse(local);
          remoteUpdateRef.current = true;
          setDoc(doc(db, 'user_lists', user.uid), {
            userId: user.uid,
            wish: st.wish || [],
            visited: st.visited || [],
            styles: st.styles || defaultState.styles,
            seasons: st.seasons || defaultState.seasons,
            updatedAt: Date.now().toString()
          }).then(() => {
            remoteUpdateRef.current = false;
          }).catch(err => {
            remoteUpdateRef.current = false;
            console.error('Failed init:', err);
          });
        }
      }
    });

    return () => unsub();
  }, [user, readOnly]);

  const save = useCallback((newState: AppState | ((prev: AppState) => AppState)) => {
    if (readOnly) return; // Prevent saving in read-only mode

    setState((prev) => {
      const computed = typeof newState === 'function' ? newState(prev) : newState;
      
      const finalState = {
        ...computed,
        wish: (computed.wish || []).map(normalizeCard),
        visited: (computed.visited || []).map(normalizeCard)
      };
      
      localStorage.setItem(SK, JSON.stringify(finalState));
      
      if (auth.currentUser) {
        remoteUpdateRef.current = true;
        setDoc(doc(db, 'user_lists', auth.currentUser.uid), {
          userId: auth.currentUser.uid,
          wish: finalState.wish,
          visited: finalState.visited,
          styles: finalState.styles,
          seasons: finalState.seasons,
          updatedAt: Date.now().toString()
        }).then(() => {
          remoteUpdateRef.current = false;
        }).catch(err => {
          remoteUpdateRef.current = false;
          console.error('Firebase save error:', err);
        });
      }
      
      return finalState;
    });
  }, [readOnly]);

  return { state, save, loaded, user, isFirebaseSyncing, readOnly };
};
