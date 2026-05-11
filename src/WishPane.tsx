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

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [longPressActive, setLongPressActive] = useState<number | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number, y: number } | null>(null);
  const lastTouchTime = useRef(0);

  const startDrag = (idx: number) => {
    setDraggingIdx(idx);
    setDragOverIdx(idx);
    if (navigator.vibrate) try { navigator.vibrate(40); } catch(e){}
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    const isHandle = (e.target as HTMLElement).closest('.drag-handle');
    if (!isHandle) {
      e.preventDefault();
      return;
    }
    setDraggingIdx(idx);
    setDragOverIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idx.toString());
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggingIdx === null) return;
    if (idx !== dragOverIdx) {
      setDragOverIdx(idx);
    }
  };

  const handleDragEnd = () => {
    if (draggingIdx !== null && dragOverIdx !== null && draggingIdx !== dragOverIdx) {
      const sItem = items[draggingIdx];
      const tItem = items[dragOverIdx];
      
      if (sItem && tItem) {
        save((prev) => {
          const newList = [...prev.wish];
          const sIdx = newList.findIndex(x => x.id === sItem.id);
          const tIdx = newList.findIndex(x => x.id === tItem.id);
          if (sIdx !== -1 && tIdx !== -1) {
            const [moved] = newList.splice(sIdx, 1);
            newList.splice(tIdx, 0, moved);
          }
          return { ...prev, wish: newList };
        });
      }
    }
    setDraggingIdx(null);
    setDragOverIdx(null);
    setLongPressActive(null);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleTouchStart = (e: React.TouchEvent, idx: number) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setLongPressActive(idx);
    
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      startDrag(idx);
      setLongPressActive(idx);
    }, 400); 
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    if (draggingIdx === null) {
      if (touchStartPos.current) {
        const dx = Math.abs(touch.clientX - touchStartPos.current.x);
        const dy = Math.abs(touch.clientY - touchStartPos.current.y);
        if (dx > 15 || dy > 15) {
          if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
          }
          setLongPressActive(null);
          touchStartPos.current = null;
        }
      }
      return;
    }

    if (e.cancelable) e.preventDefault();

    // Throttling for performance
    const now = Date.now();
    if (now - lastTouchTime.current < 50) return; 
    lastTouchTime.current = now;

    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const card = el?.closest('.wish-card');
    if (card) {
      const idx = Number(card.getAttribute('data-idx'));
      if (!isNaN(idx) && idx !== dragOverIdx) {
        setDragOverIdx(idx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    handleDragEnd();
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
              const isDragging = draggingIdx === idx;
              const isOver = dragOverIdx === idx;
              let transform = 'none';
              
              if (draggingIdx !== null && dragOverIdx !== null && !isDragging) {
                if (draggingIdx < dragOverIdx) {
                   if (idx > draggingIdx && idx <= dragOverIdx) transform = 'translateY(-100%) translateY(-11px)';
                } else if (draggingIdx > dragOverIdx) {
                   if (idx < draggingIdx && idx >= dragOverIdx) transform = 'translateY(100%) translateY(11px)';
                }
              }

              return (
                <div 
                  key={c.id} 
                  className={`card wish-card ${isDragging ? 'dragging' : ''} ${isOver ? 'drag-over' : ''} ${longPressActive === idx ? 'pressing' : ''}`}
                  data-idx={idx}
                  draggable
                  style={{ 
                    touchAction: 'none',
                    transform: transform,
                    zIndex: isDragging ? 100 : 1,
                    transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
                  }}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, idx)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="cbody" style={{ position: 'relative', paddingLeft: 42 }}>
                    <div className="drag-handle" style={{ opacity: isDragging ? 1 : 0.4 }}>
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
