import React, { useState, useEffect } from 'react';
import { RamenCard, Visit } from './types';
import { MRT } from './constants';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function Drawers({ 
  drawer, 
  onClose,
  payload,
  state,
  save
}: { 
  drawer: string | null; 
  onClose: () => void;
  payload?: any;
  state: any;
  save: (newState: any) => void;
}) {
  const [form, setForm] = useState<any>({});
  const [stars, setStars] = useState(0);
  const [mrtOpen, setMrtOpen] = useState(false);
  const [mrtLine, setMrtLine] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (drawer) {
      setForm(payload || {});
      setStars(payload?.rating || 0);
      setMrtOpen(false);
      setMrtLine(null);
    }
  }, [drawer, payload]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2300);
  };

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submitWish = () => {
    if (!form.shop) return showToast('⚠️ 請填入店名');
    save((prev) => {
      const wish = [...prev.wish];
      if (form.id) {
        const idx = wish.findIndex(w => w.id === form.id);
        if (idx > -1) wish[idx] = { ...wish[idx], ...form };
      } else {
        wish.unshift({ ...form, id: uid(), rating: 0, createdAt: new Date().toLocaleDateString('zh-TW') });
      }
      return { ...prev, wish };
    });
    onClose();
    showToast(form.id ? '✏️ 已更新！' : '🍥 加入想去清單！');
  };

  const submitVisited = () => {
    if (!form.shop) return showToast('⚠️ 請填入店名');
    
    // Only require item if we are adding a NEW visit
    const isAddingVisit = drawer === 'visited' || drawer === 'addVisit';
    if (isAddingVisit && !form.item) return showToast('⚠️ 請填入食用品項');
    
    save(prev => {
      const vDate = new Date().toLocaleDateString('zh-TW');
      const visited = [...prev.visited];
      
      const newVisit: Visit | null = isAddingVisit ? { 
        item: form.item, 
        rating: stars, 
        comment: form.comment, 
        season: form.season, 
        style: form.style, 
        id: uid() 
      } : null;

      if (form.id && drawer === 'editCard') {
        const idx = visited.findIndex(v => v.id === form.id);
        if (idx > -1) {
          visited[idx] = { ...visited[idx], shop: form.shop, station: form.station, style: form.style };
        }
      } else if (drawer === 'addVisit') {
        const idx = visited.findIndex(v => v.id === form.id);
        if (idx > -1 && newVisit) {
          if (!visited[idx].visits) visited[idx].visits = [];
          visited[idx].visits.push(newVisit);
        }
      } else {
        // Adding new shop + initial visit
        const existIdx = visited.findIndex(x => x.shop.trim() === form.shop.trim() && (x.style === form.style || !x.style));
        if (existIdx > -1 && newVisit) {
          if (!visited[existIdx].visits) visited[existIdx].visits = [];
          visited[existIdx].visits.push(newVisit);
          if (form.station) visited[existIdx].station = form.station;
          if (form.style) visited[existIdx].style = form.style;
        } else if (newVisit) {
          visited.unshift({ id: uid(), shop: form.shop, style: form.style, station: form.station, visits: [newVisit], visitedAt: vDate });
        }
      }
      return { ...prev, visited };
    });
    onClose();
    showToast(form.id ? '✏️ 已更新！' : '✅ 加入已吃清單！');
  };

  const confirmVisited = () => {
    if (!form.item) return showToast('⚠️ 請填入食用品項');
    save(prev => {
      const wishIdx = prev.wish.findIndex(w => w.id === form.id);
      if (wishIdx === -1) return prev;
      
      const orig = prev.wish[wishIdx];
      const newWish = [...prev.wish];
      newWish.splice(wishIdx, 1);
      
      const visited = [...prev.visited];
      const newVisit: Visit = { item: form.item, rating: stars, comment: form.comment, season: form.season, style: form.style, id: uid() };
      
      const existIdx = visited.findIndex(x => x.shop === orig.shop);
      if (existIdx > -1) {
         if (!visited[existIdx].visits) visited[existIdx].visits = [];
         visited[existIdx].visits.push(newVisit);
      } else {
         visited.unshift({ ...orig, id: uid(), visits: [newVisit], visitedAt: new Date().toLocaleDateString('zh-TW') });
      }
      return { ...prev, wish: newWish, visited };
    });
    onClose();
    showToast('✅ 已移至吃過清單！');
  };

  const submitVisitEdit = () => {
    if (!form.item) return showToast('⚠️ 請填入食用品項');
    save(prev => {
      const visited = [...prev.visited];
      const cIdx = visited.findIndex(x => x.id === payload.cardId);
      if (cIdx > -1 && visited[cIdx].visits) {
        visited[cIdx].visits[payload.visitIdx] = {
           ...visited[cIdx].visits[payload.visitIdx],
           item: form.item, style: form.style, season: form.season, comment: form.comment, rating: stars
        };
      }
      return { ...prev, visited };
    });
    onClose();
    showToast('✏️ 已更新記錄！');
  };

  const renderStars = () => (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`sinput ${i <= stars ? 'on' : ''}`} onClick={() => setStars(i)}>★</span>
      ))}
    </div>
  );

  const MrtSelector = () => (
    <div className="mrt-outer">
       <input className="fi" placeholder="輸入或選擇站名" value={form.station || ''} onChange={e => update('station', e.target.value)} onFocus={() => setMrtOpen(true)} onBlur={() => setTimeout(() => setMrtOpen(false), 200)} />
       {mrtOpen && (
         <div className="mrt-dd on">
           <div className="mrt-lines">
              {MRT.map((l, i) => <span key={i} className={`mrt-line ${mrtLine === i ? 'sel' : ''}`} style={{background: l.c}} onMouseDown={(e) => { e.preventDefault(); setMrtLine(i); }}>{l.s}線</span>)}
           </div>
           <div className="mrt-stas">
              {mrtLine === null ? <div className="mrt-hint">請先選擇路線</div> : 
               MRT[mrtLine].stas.filter(s => !form.station || s.includes(form.station)).map(s => (
                 <div key={s} className="mrt-sta" onMouseDown={(e) => { e.preventDefault(); update('station', s); setMrtOpen(false); }}>{s}</div>
               ))
              }
           </div>
         </div>
       )}
    </div>
  );

  return (
    <>
      <div className={`ov ${drawer ? 'on' : ''}`} onClick={onClose} />
      
      {/* 1. Add/Edit Wish */}
      <div className={`drw ${drawer === 'wish' ? 'on' : ''}`}>
        <div className="drw-handle" />
        <div className="drw-hd">
          <div className="drw-title">{form.id ? '編輯' : '新增'}<em>想去清單</em></div>
          <button className="drw-close" onClick={onClose}>✕</button>
        </div>
        <div className="drw-body">
          <div className="fg"><label className="flbl">店名 <span className="req">＊</span></label><input className="fi" value={form.shop || ''} onChange={e => update('shop', e.target.value)} /></div>
          <div className="fg"><label className="flbl">招牌拉麵 <span className="opt">選填</span></label><input className="fi" value={form.item || ''} onChange={e => update('item', e.target.value)} /></div>
          <div className="f2">
            <div className="fg"><label className="flbl">湯系</label><select className="fsel" value={form.style || ''} onChange={e => update('style', e.target.value)}><option value="">選擇</option>{state.styles.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="fg"><label className="flbl">調味</label><select className="fsel" value={form.season || ''} onChange={e => update('season', e.target.value)}><option value="">選擇</option>{state.seasons.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div className="fg"><label className="flbl">捷運站</label><MrtSelector /></div>
          <div className="fg"><label className="flbl">備註 <span className="opt">選填</span></label><textarea className="fta" value={form.comment || ''} onChange={e => update('comment', e.target.value)} /></div>
          <button className="sbtn wish" onClick={submitWish}>{form.id ? '儲存變更 🍥' : '加入想去清單 🍥'}</button>
        </div>
      </div>

      {/* 2. Add/Edit Visited (Card) */}
      <div className={`drw ${drawer === 'visited' || drawer === 'editCard' || drawer === 'addVisit' ? 'on' : ''}`}>
        <div className="drw-handle" />
        <div className="drw-hd">
          <div className="drw-title">{drawer === 'addVisit' ? '新增' : (form.id ? '編輯' : '新增')}<em className="g">{drawer === 'addVisit' ? '再訪記錄' : '已吃清單'}</em></div>
          <button className="drw-close" onClick={onClose}>✕</button>
        </div>
        <div className="drw-body">
          <div className="fg"><label className="flbl">店名 <span className="req">＊</span></label><input className="fi" value={form.shop || ''} onChange={e => update('shop', e.target.value)} disabled={drawer === 'addVisit'} /></div>
          <div className="fg"><label className="flbl">食用品項 <span className="req">＊</span></label><input className="fi" value={form.item || ''} onChange={e => update('item', e.target.value)} /></div>
          <div className="f2">
            <div className="fg"><label className="flbl">湯系</label><select className="fsel" value={form.style || ''} onChange={e => update('style', e.target.value)} disabled={drawer === 'addVisit'}><option value="">選擇</option>{state.styles.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="fg"><label className="flbl">調味</label><select className="fsel" value={form.season || ''} onChange={e => update('season', e.target.value)}><option value="">選擇</option>{state.seasons.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div className="fg"><label className="flbl">捷運站</label><MrtSelector /></div>
          <div className="fg"><label className="flbl">評分</label>{renderStars()}</div>
          <div className="fg"><label className="flbl">評語 <span className="opt">選填</span></label><textarea className="fta" value={form.comment || ''} onChange={e => update('comment', e.target.value)} /></div>
          <button className="sbtn visited" onClick={submitVisited}>{drawer === 'addVisit' ? '加入再訪記錄 ✅' : '加入已吃清單 ✅'}</button>
        </div>
      </div>

      {/* 3. Confirm Visited from Wishlist */}
      <div className={`drw ${drawer === 'confirm' ? 'on' : ''}`}>
        <div className="drw-handle" />
        <div className="drw-hd">
          <div className="drw-title">標記<em className="g">已吃！</em></div>
          <button className="drw-close" onClick={onClose}>✕</button>
        </div>
        <div className="drw-body">
          <div className="conf-card"><div className="conf-shop">{form.shop}</div><div className="conf-sub">{form.station ? `🚇 ${form.station}` : ''}{form.style ? ` · ${form.style}` : ''}</div></div>
          <div className="fg"><label className="flbl">食用品項 <span className="req">＊</span></label><input className="fi" value={form.item || ''} onChange={e => update('item', e.target.value)} /></div>
          <div className="f2">
            <div className="fg"><label className="flbl">湯系</label><select className="fsel" value={form.style || ''} onChange={e => update('style', e.target.value)}><option value="">選擇</option>{state.styles.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="fg"><label className="flbl">調味</label><select className="fsel" value={form.season || ''} onChange={e => update('season', e.target.value)}><option value="">選擇</option>{state.seasons.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div className="fg"><label className="flbl">評分 <span className="opt">選填</span></label>{renderStars()}</div>
          <div className="fg"><label className="flbl">評語 <span className="opt">選填</span></label><textarea className="fta" value={form.comment || ''} onChange={e => update('comment', e.target.value)} /></div>
          <button className="sbtn visited" onClick={confirmVisited}>移至已吃清單 ✅</button>
        </div>
      </div>

      {/* 4. Edit single Visit Entry */}
      <div className={`drw ${drawer === 'editVisit' ? 'on' : ''}`}>
         <div className="drw-handle" />
         <div className="drw-hd">
           <div className="drw-title">編輯<em className="g">品項記錄</em></div>
           <button className="drw-close" onClick={onClose}>✕</button>
         </div>
         <div className="drw-body">
            <div className="fg"><label className="flbl">食用品項 <span className="req">＊</span></label><input className="fi" value={form.item || ''} onChange={e => update('item', e.target.value)} /></div>
            <div className="f2">
              <div className="fg"><label className="flbl">湯系</label><select className="fsel" value={form.style || ''} onChange={e => update('style', e.target.value)}><option value="">選擇</option>{state.styles.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="fg"><label className="flbl">調味</label><select className="fsel" value={form.season || ''} onChange={e => update('season', e.target.value)}><option value="">選擇</option>{state.seasons.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            </div>
            <div className="fg"><label className="flbl">評分</label>{renderStars()}</div>
            <div className="fg"><label className="flbl">評語 <span className="opt">選填</span></label><textarea className="fta" value={form.comment || ''} onChange={e => update('comment', e.target.value)} /></div>
            <button className="sbtn visited" onClick={submitVisitEdit}>儲存變更 ✅</button>
         </div>
      </div>

      {/* 5. Manage Drawer (Styles & Seasons) */}
      <div className={`drw ${drawer === 'manage' ? 'on' : ''}`}>
        <div className="drw-handle" />
        <div className="drw-hd">
          <div className="drw-title">管理<em>選單項目</em></div>
          <button className="drw-close" onClick={onClose}>✕</button>
        </div>
        <div className="drw-body">
           <div className="mng-sec">湯系</div>
           <div className="mng-list">
              {state.styles.map((s, idx) => (
                 <div key={idx} className="mng-item"><span>{s}</span><button className="mng-del" onClick={() => save(p => ({...p, styles: p.styles.filter((_, i) => i !== idx)}))}>✕ 刪除</button></div>
              ))}
              {state.styles.length === 0 && <div style={{fontSize: 12, color: 'var(--ink-soft)'}}>尚無項目</div>}
           </div>
           <div className="mng-add-row">
              <input className="fi" placeholder="新增湯系..." value={form.newStyle || ''} onChange={e => update('newStyle', e.target.value)} />
              <button className="mbtn" onClick={() => { if(form.newStyle) { save(p => ({...p, styles: [...p.styles, form.newStyle]})); update('newStyle', ''); showToast('✅ 已新增！') } }}>＋ 新增</button>
           </div>

           <div className="mng-sec">調味</div>
           <div className="mng-list">
              {state.seasons.map((s, idx) => (
                 <div key={idx} className="mng-item"><span>{s}</span><button className="mng-del" onClick={() => save(p => ({...p, seasons: p.seasons.filter((_, i) => i !== idx)}))}>✕ 刪除</button></div>
              ))}
              {state.seasons.length === 0 && <div style={{fontSize: 12, color: 'var(--ink-soft)'}}>尚無項目</div>}
           </div>
           <div className="mng-add-row">
              <input className="fi" placeholder="新增調味..." value={form.newSeason || ''} onChange={e => update('newSeason', e.target.value)} />
              <button className="mbtn" onClick={() => { if(form.newSeason) { save(p => ({...p, seasons: [...p.seasons, form.newSeason]})); update('newSeason', ''); showToast('✅ 已新增！') } }}>＋ 新增</button>
           </div>
        </div>
      </div>

      <div className={`toast ${toastMsg ? 'on' : ''}`}>{toastMsg}</div>
    </>
  );
}
