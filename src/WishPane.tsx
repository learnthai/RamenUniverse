import React, { useState, useMemo, useRef } from 'react';
import { RamenCard } from './types';
import { ICONS, MRT } from './constants';
import { useStore } from './store';

interface WishPaneProps {
  wish: RamenCard[];
  onEdit: (id: string) => void;
  onDel: (id: string) => void;
  onCheck: (id: string) => void;
}

export function WishPane({ wish, onEdit, onDel, onCheck }: WishPaneProps) {
  const { state, save } = useStore();
  const [q, setQ] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string | null>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const items = useMemo(() => {
    let res = wish;
    if (q) {
      const ql = q.toLowerCase();
      res = res.filter(c => 
        c.shop.toLowerCase().includes(ql) || 
        (c.station || '').includes(q) || 
        (c.item || '').toLowerCase().includes(ql)
      );
    }
    if (filterValue && filterType) {
      if (filterType === 'station') res = res.filter(c => c.station === filterValue);
      if (filterType === 'shop') res = res.filter(c => c.shop === filterValue);
      if (filterType === 'style') res = res.filter(c => c.style === filterValue);
      if (filterType === 'season') res = res.filter(c => c.season === filterValue);
    }
    return res;
  }, [wish, q, filterType, filterValue]);

  const handleDragStart = (e: React.DragEvent | React.TouchEvent, id: string) => {
    setDraggingId(id);
    if ('dataTransfer' in e) {
       e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggingId === null) return;
    if (id !== dragOverId) setDragOverId(id);
  };

  const handleDragEnd = () => {
    if (draggingId !== null && dragOverId !== null && draggingId !== dragOverId) {
      save((prev) => {
        const newList = [...prev.wish];
        const sIdx = newList.findIndex(x => x.id === draggingId);
        const tIdx = newList.findIndex(x => x.id === dragOverId);
        
        if (sIdx !== -1 && tIdx !== -1) {
          const [moved] = newList.splice(sIdx, 1);
          newList.splice(tIdx, 0, moved);
        }
        return { ...prev, wish: newList };
      });
    }
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingId === null) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const card = el?.closest('.wish-card');
    if (card) {
      const id = card.getAttribute('data-id');
      if (id && id !== dragOverId) setDragOverId(id);
    }
  };

  const filterLabels: Record<string, string> = {
    station: '捷運站',
    shop: '店家',
    style: '湯系',
    season: '調味'
  };

  const getOptions = (type: string) => {
    let opts: string[] = [];
    if (type === 'station') opts = [...new Set(wish.map(c => c.station).filter(Boolean) as string[])];
    if (type === 'shop') opts = [...new Set(wish.map(c => c.shop))];
    if (type === 'style') opts = [...new Set(wish.map(c => c.style).filter(Boolean) as string[])];
    if (type === 'season') opts = [...new Set(wish.map(c => c.season).filter(Boolean) as string[])];
    return opts.sort();
  };

  const getMrtColor = (sta: string) => {
    if (!sta) return null;
    const line = MRT.find(l => l.stas.includes(sta));
    return line ? line.c : null;
  };

  const toggleFilter = (type: string) => {
    if (filterType === type) {
      setFilterType(null);
      setFilterValue(null);
    } else {
      setFilterType(type);
    }
  };

  return (
    <div className="pane on">
      <div className="search-bar">
        <div className="search-wrap">
          <ICONS.Search />
          <input 
            className="search-inp" 
            placeholder="搜尋店名、站名..." 
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        {q && <div className="s-clear show" onClick={() => setQ('')}>✕</div>}
      </div>

      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 6px', padding: '0 14px', overflowX: 'visible' }}>
        {Object.entries(filterLabels).map(([key, label]) => (
          <button 
            key={key}
            className={`fbtn ${filterType === key ? 'on-wish' : ''}`} 
            onClick={() => toggleFilter(key)}
          >
            {label} ▾
          </button>
        ))}
        {filterValue && (
          <button className="fbtn" style={{color: 'var(--red)'}} onClick={() => { setFilterType(null); setFilterValue(null); }}>
            清除 ✕
          </button>
        )}
      </div>

      {filterType && !filterValue && (
        <div className="filter-panel show">
          <div className="fp-lbl">{filterLabels[filterType]}</div>
          <div className="fp-chips">
            {getOptions(filterType).map(opt => (
              <div 
                key={opt}
                className="fp-chip" 
                onClick={() => setFilterValue(opt)}
              >
                {opt}
              </div>
            ))}
            {getOptions(filterType).length === 0 && (
              <div style={{fontSize: 12, color: 'var(--ink-soft)'}}>尚無資料</div>
            )}
          </div>
          <div className="fp-clear" onClick={() => setFilterType(null)}>清除篩選</div>
        </div>
      )}

      {filterType && filterValue && (
        <div className="filter-panel show">
          <div className="fp-lbl">{filterLabels[filterType]}</div>
          <div className="fp-chips">
            <div className="fp-chip sel-wish" onClick={() => setFilterValue(null)}>
              {filterValue}
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="grid-area">
          <div className="empty">
            <div className="empty-ico" style={{ display: 'flex', justifyContent: 'center' }}>
              {q || filterValue ? <ICONS.SearchBig /> : <ICONS.NarutoBig />}
            </div>
            <h3>{q || filterValue ? '沒有符合的結果' : '還沒有想去的店'}</h3>
            <p>{q || filterValue ? '' : '點右下角 ＋ 開始建立願望清單！'}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="sec-lbl">
            <span className="sl-txt">WISHLIST</span>
            <span className="sec-line"></span>
            <span className="sec-cnt">{items.length} 家</span>
          </div>
          <div className="grid-area">
            {items.map((c, idx) => {
              const isDragging = draggingId === c.id;
              const isOver = dragOverId === c.id;
              
              // Find indices in the current display list for visual transform
              const dIdx = draggingId ? items.findIndex(x => x.id === draggingId) : -1;
              const oIdx = dragOverId ? items.findIndex(x => x.id === dragOverId) : -1;
              
              let transform = 'none';
              if (dIdx !== -1 && oIdx !== -1 && !isDragging) {
                if (dIdx < oIdx) {
                   if (idx > dIdx && idx <= oIdx) transform = 'translateY(-100%) translateY(-11px)';
                } else if (dIdx > oIdx) {
                   if (idx < dIdx && idx >= oIdx) transform = 'translateY(100%) translateY(11px)';
                }
              }

              return (
                <div 
                  key={c.id} 
                  className={`card wish-card ${isDragging ? 'dragging' : ''} ${isOver ? 'drag-over' : ''}`}
                  data-idx={idx}
                  data-id={c.id}
                  draggable
                  style={{ 
                    touchAction: 'none',
                    transform: transform,
                    zIndex: isDragging ? 100 : 1,
                    transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
                  }}
                  onDragStart={(e) => handleDragStart(e, c.id)}
                  onDragOver={(e) => handleDragOver(e, c.id)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleDragStart(e, c.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleDragEnd}
                >
                  <div className="cbody" style={{ position: 'relative', paddingLeft: 42 }}>
                    <div className="drag-handle">
                      <ICONS.Menu />
                    </div>
                    <div className="crow-top">
                      <span className="ccheck" onClick={() => onCheck(c.id)}><ICONS.CircleEmpty /></span>
                      <a className="cname" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.shop + ' 台北拉麵')}`} target="_blank" rel="noopener noreferrer">{c.shop}</a>
                      <div className="cactions">
                        <div className="cact edit" onClick={(e) => { e.stopPropagation(); onEdit(c.id); }}><ICONS.Edit /></div>
                        <div className="cact del" onClick={(e) => { e.stopPropagation(); onDel(c.id); }}><ICONS.Delete /></div>
                      </div>
                    </div>
                    {c.item && <div className="citem"><span className="clabel wish">招牌</span><span style={{ color: '#261f15' }}>{c.item}</span></div>}
                    <div className="ctags">
                      {c.style && <span className="ctag sty">{c.style}</span>}
                      {c.season && <span className="ctag sea">{c.season}</span>}
                      {c.station && (
                        <span className="ctag sta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {getMrtColor(c.station) ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: getMrtColor(c.station)! }} /> : '🚇'} {c.station}
                        </span>
                      )}
                    </div>
                    {c.comment && <div className="cnote" style={{ borderColor: '#1e1914', color: '#726a63' }}>📝 {c.comment}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
