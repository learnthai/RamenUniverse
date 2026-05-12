import React, { useState, useMemo, useRef } from 'react';
import { RamenCard } from './types';
import { ICONS, MRT } from './constants';
import { useStore } from './store';

interface WishPaneProps {
  wish: RamenCard[];
  save: (newState: any | ((prev: any) => any)) => void;
  onEdit: (id: string) => void;
  onDel: (id: string) => void;
  onCheck: (id: string) => void;
}

export function WishPane({ wish, save, onEdit, onDel, onCheck }: WishPaneProps) {
  const [q, setQ] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string | null>(null);

  const [dragState, setDragState] = useState<{ from: string | null; over: string | null }>({ from: null, over: null });
  const draggingId = useRef<string | null>(null);
  const dragOverId = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  React.useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement;
      const handle = target.closest('.drag-handle');
      if (!handle) return;

      const card = handle.closest('.wish-card') as HTMLElement | null;
      if (!card) return;

      const id = card.getAttribute('data-id');
      if (!id) return;

      // Crucial: Prevent default to stop scrolling
      e.preventDefault();

      draggingId.current = id;
      setDragState({ from: id, over: null });

      // Visual feedback: pin the dragged card to the pointer
      const rect = card.getBoundingClientRect();
      const startY = e.clientY;
      const startTop = rect.top;

      // Insert placeholder to keep layout stable
      const placeholder = document.createElement('div');
      placeholder.style.height = rect.height + 'px';
      placeholder.style.marginBottom = '11px';
      placeholder.id = 'drag-placeholder';
      card.parentNode?.insertBefore(placeholder, card);

      card.style.position = 'fixed';
      card.style.top = rect.top + 'px';
      card.style.left = rect.left + 'px';
      card.style.width = rect.width + 'px';
      card.style.zIndex = '999';
      card.style.opacity = '0.75';
      card.style.pointerEvents = 'none';
      card.style.transition = 'none';

      function onMove(ev: PointerEvent) {
        ev.preventDefault();
        const dy = ev.clientY - startY;
        if (card) card.style.top = (startTop + dy) + 'px';

        const els = document.elementsFromPoint(ev.clientX, ev.clientY);
        const targetCard = els.find(
          el => el.classList.contains('wish-card') && el.getAttribute('data-id') !== id
        );
        const overId = targetCard?.getAttribute('data-id') ?? null;
        if (overId !== dragOverId.current) {
          dragOverId.current = overId;
          setDragState({ from: id, over: overId });
        }
      }

      function onUp() {
        const from = draggingId.current;
        const over = dragOverId.current;

        // Query live DOM for the card since it might have been re-rendered or we need a fresh ref
        const liveCard = container?.querySelector(`.wish-card[data-id="${id}"]`) as HTMLElement | null;
        if (liveCard) {
          liveCard.style.position = '';
          liveCard.style.top = '';
          liveCard.style.left = '';
          liveCard.style.width = '';
          liveCard.style.zIndex = '';
          liveCard.style.opacity = '';
          liveCard.style.pointerEvents = '';
          liveCard.style.transition = '';
        }
        
        // Remove placeholder
        document.getElementById('drag-placeholder')?.remove();

        draggingId.current = null;
        dragOverId.current = null;
        setDragState({ from: null, over: null });

        if (from && over && from !== over) {
          save((prev: any) => {
            const newList = [...prev.wish];
            const sIdx = newList.findIndex((x: any) => x.id === from);
            if (sIdx === -1) return prev;
            
            const [moved] = newList.splice(sIdx, 1);
            const tIdx = newList.findIndex((x: any) => x.id === over);
            
            if (tIdx !== -1) {
              newList.splice(tIdx, 0, moved);
            } else {
              // Fallback: if over item not found (unlikely), just put at end or keep original
              newList.splice(sIdx, 0, moved);
              return prev;
            }
            
            return { ...prev, wish: newList };
          });
        }

        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      }

      document.addEventListener('pointermove', onMove, { passive: false });
      document.addEventListener('pointerup', onUp);
    }

    container.addEventListener('pointerdown', onPointerDown, { passive: false });
    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
    };
  }, [save]);

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
          <div className="grid-area" ref={listRef}>
            {items.map((c, idx) => {
              const isDragging = dragState.from === c.id;
              const isOver = dragState.over === c.id;

              return (
                <div 
                  key={c.id} 
                  className={`card wish-card ${isDragging ? 'dragging' : ''} ${isOver ? 'drag-over' : ''}`}
                  data-idx={idx}
                  data-id={c.id}
                  style={{ 
                    opacity: isDragging ? 0.5 : 1,
                    transform: isOver ? 'translateY(4px) scale(1.01)' : 'none',
                    transition: isDragging ? 'none' : 'transform 0.15s, opacity 0.15s',
                    zIndex: isDragging ? 50 : 1,
                    position: 'relative',
                  }}
                >
                  <div className="cbody" style={{ position: 'relative', paddingLeft: 42 }}>
                    <div 
                      className="drag-handle"
                      style={{ touchAction: 'none', cursor: 'grab', color: 'var(--red)' }}
                    >
                      <ICONS.Menu />
                    </div>
                    <div className="crow-top">
                      <span className="ccheck" onClick={() => onCheck(c.id)}><ICONS.CircleEmpty /></span>
                      <a 
                        className="cname" 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.shop + ' 台北拉麵')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onPointerDown={(e) => e.stopPropagation()}
                      >{c.shop}</a>
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
