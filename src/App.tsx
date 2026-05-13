import React, { useState } from 'react';
import { useStore } from './store';
import { ICONS } from './constants';
import { Deco } from './Deco';
import { WishPane } from './WishPane';
import { VisitedPane } from './VisitedPane';
import { MapPane } from './MapPane';
import { SharePane } from './SharePane';
import { ShareViewer } from './ShareViewer';
import { Drawers } from './Drawers';

export default function App() {
  const { state, save, loaded, readOnly, user } = useStore();
  const [curTab, setCurTab] = useState<'wish'|'visited'|'map'|'export'>('wish');

  // Handle Share URL Parameter for compress mode
  const [shareData, setShareData] = useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const share = params.get('share');
    if (share && !params.has('shareId')) {
      setShareData(share);
    }
  }, []);

  const [drawer, setDrawer] = useState<string | null>(null);
  const [drawerPayload, setDrawerPayload] = useState<any>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{msg: string, action: string, payload?: any} | null>(null);

  if (!loaded) return null;

  const openDrawer = (name: string, payload?: any) => {
    if (readOnly) return; // Disallow opening edit drawers
    setDrawerPayload(payload);
    setDrawer(name);
  };

  const handleConfirm = () => {
    if (!confirmDialog || readOnly) return;
    
    // Store logic
    save((prev) => {
      let next = { ...prev };
      if (confirmDialog.action === 'del_wish') {
        next.wish = next.wish.filter(x => x.id !== confirmDialog.payload);
      } else if (confirmDialog.action === 'del_visited_card') {
        next.visited = next.visited.filter(x => x.id !== confirmDialog.payload);
      } else if (confirmDialog.action === 'del_visited_entry') {
        const { cardId, idx } = confirmDialog.payload;
        const newVisited = [...next.visited];
        const cIdx = newVisited.findIndex(x => x.id === cardId);
        if (cIdx !== -1 && newVisited[cIdx].visits) {
          const newVisits = [...newVisited[cIdx].visits!];
          newVisits.splice(idx, 1);
          newVisited[cIdx] = { ...newVisited[cIdx], visits: newVisits };
          if (newVisits.length === 0) newVisited.splice(cIdx, 1);
        }
        next.visited = newVisited;
      }
      return next;
    });
    setConfirmDialog(null);
  };

  const clearShareId = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <>
      {shareData && <ShareViewer dataString={shareData} onClose={() => {
        setShareData(null);
        window.history.replaceState({}, '', window.location.pathname);
      }} />}
      
      {readOnly && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'var(--red)', color: '#fff', fontSize: 13, fontWeight: 800, padding: 8, textAlign: 'center', zIndex: 10000, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          <span>🍜 正在觀看即時分享清單 (唯讀模式)</span>
        </div>
      )}

      <Deco />
      <div id="app" style={{ paddingTop: readOnly ? 36 : 0 }}>
        <header className="hd">
          <div className="hd-top">
            <div className="logo">
              <span className="logo-icon" style={{display: 'inline-flex', alignItems: 'center'}}>
                <ICONS.RamenLogo />
              </span>
              <span className="logo-text">拉麵<em>です</em></span>
            </div>
            {!readOnly && (
              <div className="hd-btns">
                <button className="hbtn" title="管理選單" onClick={() => openDrawer('manage')}>
                  <ICONS.Sun />
                </button>
              </div>
            )}
          </div>
          <div className="tabs" style={{ paddingLeft: 23, paddingRight: 0, marginLeft: -3 }}>
            <button className={`tab ${curTab === 'wish' ? 'on' : ''}`} onClick={() => setCurTab('wish')} data-t="wish" style={{ paddingLeft: 15, marginLeft: 4, marginTop: 2, marginRight: 3 }}>想去 <span className="tab-n">{state.wish.length}</span></button>
            <button className={`tab ${curTab === 'visited' ? 'on' : ''}`} onClick={() => setCurTab('visited')} data-t="visited" style={{ marginRight: 4 }}>已吃 <span className="tab-n">{state.visited.length}</span></button>
            <button className={`tab ${curTab === 'map' ? 'on' : ''}`} onClick={() => setCurTab('map')} data-t="map" style={{ marginRight: 4 }}>地圖</button>
            <button className={`tab ${curTab === 'export' ? 'on' : ''}`} onClick={() => setCurTab('export')} data-t="export">分享</button>
          </div>
        </header>
        <main className="main">
          {curTab === 'wish' && (
            <WishPane 
              wish={state.wish} 
              save={save}
              onEdit={readOnly ? () => {} : (id) => openDrawer('wish', state.wish.find(x => x.id === id))} 
              onDel={readOnly ? () => {} : (id) => setConfirmDialog({ msg: '確定刪除這家嗎？', action: 'del_wish', payload: id })} 
              onCheck={readOnly ? () => {} : (id) => openDrawer('confirm', state.wish.find(x => x.id === id))} 
            />
          )}

          {curTab === 'visited' && (
            <VisitedPane 
              visited={state.visited} 
              onAddVisit={readOnly ? () => {} : (cardId) => openDrawer('addVisit', state.visited.find(x => x.id === cardId))}
              onEditCard={readOnly ? () => {} : (id) => openDrawer('editCard', state.visited.find(x => x.id === id))}
              onDelCard={readOnly ? () => {} : (id) => setConfirmDialog({ msg: '確定刪除這間店的所有記錄嗎？', action: 'del_visited_card', payload: id })}
              onEditVisit={readOnly ? () => {} : (cardId, idx) => {
                const c = state.visited.find(x => x.id === cardId);
                if (c && c.visits) openDrawer('editVisit', { cardId, visitIdx: idx, ...c.visits[idx] });
              }}
              onDelVisit={readOnly ? () => {} : (cardId, idx) => setConfirmDialog({ msg: '確定刪除這筆記錄嗎？', action: 'del_visited_entry', payload: { cardId, idx } })}
            />
          )}

          {curTab === 'map' && (
            <div className="pane on" style={{ padding: 0 }}>
              <MapPane />
            </div>
          )}

          {curTab === 'export' && (
            <SharePane />
          )}
        </main>
        
        {!readOnly && curTab !== 'map' && curTab !== 'export' && (
           <button 
             className={`fab ${curTab === 'visited' ? 'c-visited' : 'c-wish'}`} 
             onClick={() => openDrawer(curTab === 'visited' ? 'visited' : 'wish')}
           >
             ＋
           </button>
        )}
      </div>

      {!readOnly && (
        <Drawers 
          drawer={drawer} 
          payload={drawerPayload} 
          onClose={() => setDrawer(null)} 
          state={state}
          save={save}
        />
      )}
      
      {confirmDialog && (
        <div className="ov on" style={{zIndex: 1000}}>
          <div style={{
             position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
             background: 'var(--bg)', border: '2px solid var(--ink)', padding: '24px', 
             borderRadius: '20px', width: '280px', textAlign: 'center', boxShadow: '4px 4px 0 1px var(--ink)'
          }}>
            <h3 style={{fontSize: 16, fontWeight: 700, margin: '0 0 20px', color: 'var(--ink)'}}>{confirmDialog.msg}</h3>
            <div style={{display: 'flex', gap: 12}}>
              <button 
                onClick={() => setConfirmDialog(null)}
                style={{flex: 1, padding: '12px', border: '1.5px solid var(--ink)', borderRadius: '12px', background: 'var(--bg-mid)', fontWeight: 600, color: 'var(--ink)'}}
              >取消</button>
              <button 
                onClick={handleConfirm}
                style={{flex: 1, padding: '12px', border: '1.5px solid var(--ink)', borderRadius: '12px', background: 'var(--red)', fontWeight: 600, color: '#fff'}}
              >確定刪除</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
