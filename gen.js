const fs = require('fs');

const raw = `✓ ⚡貝系湯底 /墨洋 (極上貝貝)  →公館站 叉燒飯讚 湯鮮甜👍🏾👍🏾
 ✓ ⚡豚骨湯底 / 真劍 (豚骨拉麵) →台電大樓站 👍🏾👍🏾
 ✓ ⚡雞白湯底 / Soba Shinn & 柑橘 (柑橘蛤蜊雞白湯 濃厚) →敦化or 信義安和中間 👍🏾👍🏾👍🏾👍🏾
 ✓ ⚡泡系湯底 / 麵屋壹慶 (豚骨鹽味) →中山國小站👍🏾👍🏾👍🏾
 ◦ ⚡鹽味湯底 / 創作拉麵 悠然 (每周不一樣 虱目魚雞湯 清爽) →中山國小站
 ✓ ⚡味噌湯底 / 鬼金棒 →中山站
 ✓ ⚡煮干系 / 麵屋壹之穴 (豚骨煮干拉麵 hen濃 偏鹹) →國父紀念館站🤏🏾
 ✓ ⚡濃湯系 / 鷹流東京拉麵 
 ◦ ⚡橫濱家系 / 大和家 (631拉麵) →中山站
 ◦ ⚡二郎系 / 雞二 (肉超滿) →信義安和
 ✓ 柑橘/煮干/ 隱日→ 板橋👍🏾👍🏾👍🏾
 ◦ ⚡️煮干系/亨星
 ✓ 鹽味/塩琉拉麵（干貝龍蝦清湯）→ 北車👍🏾👍🏾
 ✓ 豚骨白湯/山嵐 👍🏾👍🏾👍🏾
 ✓ 魚介豚骨/山嵐（海湯豐盛）👍🏾👍🏾👍🏾
 ✓ 牡蠣/二屋→👍🏾 可嘗試一次
 ◦ 煮干/麵屋敬太→淡水
 ✓ 泡系/旨燕→西門 👍🏾
 ✓ 煮干/拉麵公子→ 南京復興 👍🏾👍🏾
 ✓ 數寄屋（雞白湯）→台電大樓👍🏾👍🏾👍🏾
 ✓ 双豚/→ 新埔民生 👍🏾👍🏾
 ✓ 海鮮白湯/湮鯱（黑雕濃湯）→ 忠孝復興 👍🏾👍🏾👍🏾
 ◦ 泡系鴨白湯/蒝山→大安
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
 ◦ 雞白湯/麵魚堺→科技大樓站
 ✓ 龍蝦海膽/塩琉（林森店）→中山👍🏾👍🏾👍🏾👍🏾
 ✓ 醬油豚骨/豚小屋→輔大👍🏾👍🏾👍🏾
 ◦ 醬油.雞白湯/麵魚→科技大樓
 ✓ 雞白湯/吉天元→西門👍🏾👍🏾👍🏾
 ◦ 雞白湯/麵屋昕家→內湖
 ✓ 雞白湯/銀座篝→中山國小👍🏾👍🏾
 ✓ 魚.蝦湯/麵屋有漁→西門👍🏾👍🏾👍🏾
 ✓ 味增雞白湯加辣/麵屋倫太郎→新莊👍🏾👍🏾
 ◦ 雞白湯/麵屋一貴→林口
 ◦ 蝦雲吞雞湯/座位有限→信義安和
 ✓ 桂花鹽味.海膽雞白/龍麟→中山👍🏾
 ✓ 重口味/梨橙（水豚）→敦化👍🏾👍🏾
 ✓ 乾面/東京油組→中山👍🏾👍🏾👍🏾
 ✓ 茶拉麵/茶悟拉麵→中山👍🏾
 ✓ 鹽味.限定/chill ramen →中山👍🏾👍🏾
 ◦ 牡蠣雞白湯/北海道拉麵：魚貝和雞→東區
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
 ◦ 酸辣拉麵➕香菜/鈞拉麵→新埔
 ◦ 鹽味豚骨/吉光
 ✓ 麵魚.滿雞軒→雙連 👍🏾👍🏾👍🏾`;

const wishes = [];
const visits = [];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const lines = raw.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim();
  if (!line) continue;
  
  if (line.startsWith('鹽：')) {
    continue; // handle extra line for 丸舢
  }
  
  let isVisited = line.startsWith('✓');
  let isWish = line.startsWith('◦');
  
  if (!isVisited && !isWish) continue;
  
  line = line.replace(/^[✓◦]\s*/, '');
  line = line.replace(/⚡/g, '').trim();
  
  // count emoji
  const starMatch = line.match(/👍🏾/g);
  const rating = starMatch ? starMatch.length : 0;
  line = line.replace(/👍🏾/g, '').trim();
  
  let shop = '';
  let style = '';
  let station = '';
  let item = '';
  let comment = '';
  
  // special case
  if (line.includes('數寄屋（雞白湯）')) {
      shop = '數寄屋';
      style = '雞白湯';
      let statMatch = line.match(/→\s*(.*?)$/);
      if (statMatch) station = statMatch[1].trim();
  }
  // split by /
  else if (line.includes('/')) {
      let parts = line.split('/');
      style = parts[0].replace('湯底', '').replace('系', '').trim();
      let right = parts.slice(1).join('/');
      
      // Right contains shop (item) -> station comment
      let statMatch = right.match(/→\s*(.*?)$/);
      if (statMatch) {
          station = statMatch[1].trim();
          right = right.replace(/→\s*.*$/, '').trim();
      }
      
      // Match item in parentheses
      let itemMatch = right.match(/\((.*?)\)/);
      if (itemMatch) {
          item = itemMatch[1].trim();
          right = right.replace(/\(.*\)/, '').trim();
      }
      
      shop = right.trim();
  } else {
      // no style?
      continue;
  }
  
  // Add rating to comment if station has extra text
  if (station.includes(' ')) {
      let stParts = station.split(' ');
      station = stParts[0];
      comment = stParts.slice(1).join(' ');
  }
  
  if (!style || !shop) continue;
  
  if (shop === '丸舢') {
      comment = '鹽：👍🏾 👍🏾';
      rating = 2; // based on next line
  }

  // Cleanup station logic
  station = station.replace(/站$/, '').trim();
  
  if (isWish) {
      wishes.push({
          id: generateId(),
          shop,
          style,
          station: station || undefined,
          item: item || undefined,
          comment: comment || undefined
      });
  } else {
      visits.push({
          id: generateId(),
          shop,
          style,
          station: station || undefined,
          visits: [{
              id: generateId(),
              item: item || undefined,
              rating,
              comment: comment || undefined,
              style,
              season: ''
          }]
      });
  }
}

fs.writeFileSync('migrated.json', JSON.stringify({ wishes, visits }, null, 2));

