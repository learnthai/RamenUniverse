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

  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragInfo = useRef<{
    startY: number;
    startIndex: number;
    cardId: string;
    moved: boolean;
    currentDelta: number;
  } | null>(null);

  // Link mis-trigger prevention
  const linkTouch = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);

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
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      const handle = (e.target as HTMLElement).closest('.drag-handle');
      const card = (e.target as HTMLElement).closest('.wish-card') as HTMLElement;
      
      // Link protection logic
      const link = (e.target as HTMLElement).closest('.cname');
      if (link) {
        linkTouch.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, moved: false };
      }

      if (!handle || !card) return;

      const idx = Number(card.getAttribute('data-idx'));
      const id = card.getAttribute('data-id');
      if (isNaN(idx) || !id) return;

      dragInfo.current = {
        startY: e.touches[0].clientY,
        startIndex: idx,
        cardId: id,
        moved: false,
        currentDelta: 0
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      // Link protection
      if (linkTouch.current) {
        const dx = Math.abs(e.touches[0].clientX - linkTouch.current.startX);
        const dy = Math.abs(e.touches[0].clientY - linkTouch.current.startY);
        if (dx > 5 || dy > 5) linkTouch.current.moved = true;
      }

      if (!dragInfo.current) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - dragInfo.current.startY;
      dragInfo.current.currentDelta = deltaY;

      if (!dragInfo.current.moved && Math.abs(deltaY) > 8) {
        dragInfo.current.moved = true;
        setDraggingCardId(dragInfo.current.cardId);
        if (navigator.vibrate) try { navigator.vibrate(40); } catch(err) {}
      }

      if (dragInfo.current.moved) {
        if (e.cancelable) e.preventDefault();
        
        // Visual follow
        const draggingEl = container.querySelector(`[data-id="${dragInfo.current.cardId}"]`) as HTMLElement;
        if (draggingEl) {
          draggingEl.style.transform = `translateY(${deltaY}px)`;
          draggingEl.style.zIndex = '100';
        }

        // Shift others
        const cards = Array.from(container.querySelectorAll('.wish-card')) as HTMLElement[];
        const dragRect = draggingEl.getBoundingClientRect();
        const dragCenter = dragRect.top + dragRect.height / 2;

        cards.forEach((c) => {
          if (c.getAttribute('data-id') === dragInfo.current?.cardId) return;
          const rect = c.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          
          if (deltaY > 0) { // Dragging down
            if (center > dragInfo.current!.startY && center < dragCenter) {
              c.classList.add('drag-over-up');
              c.classList.remove('drag-over-down');
            } else {
              c.classList.remove('drag-over-up', 'drag-over-down');
            }
          } else { // Dragging up
            if (center < dragInfo.current!.startY && center > dragCenter) {
              c.classList.add('drag-over-down');
              c.classList.remove('drag-over-up');
            } else {
              c.classList.remove('drag-over-up', 'drag-over-down');
            }
          }
        });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      // Link protection
      if (linkTouch.current?.moved) {
        // We can't easily prevent the click if it was already triggered or going to be
        // but adding this to the link handler is better.
      }
      linkTouch.current = null;

      if (!dragInfo.current) return;

      if (dragInfo.current.moved) {
        const draggingEl = container.querySelector(`[data-id="${dragInfo.current.cardId}"]`) as HTMLElement;
        const cards = Array.from(container.querySelectorAll('.wish-card')) as HTMLElement[];
        
        // Final position calculation
        let targetIdx = dragInfo.current.startIndex;
        const dragRect = draggingEl.getBoundingClientRect();
        const dragCenter = dragRect.top + dragRect.height / 2;

        const otherCards = cards.filter(c => c.getAttribute('data-id') !== dragInfo.current?.cardId);
        
        // Simplified target index estimation: 
        // Iterate through all other cards and see how many we jumped over
        let jumpedCount = 0;
        otherCards.forEach((c) => {
          const rect = c.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          if (dragInfo.current!.currentDelta > 0) {
             if (center > dragInfo.current!.startY && center < dragCenter) jumpedCount++;
          } else {
             if (center < dragInfo.current!.startY && center > dragCenter) jumpedCount--;
          }
        });
        targetIdx += jumpedCount;

        // Perform move
        const sItem = items[dragInfo.current.startIndex];
        const tItem = items[targetIdx];

        if (sItem && tItem && sItem.id !== tItem.id) {
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

      // Cleanup visuals
      const allCards = container.querySelectorAll('.wish-card') as NodeListOf<HTMLElement>;
      allCards.forEach(c => {
        c.style.transform = '';
        c.style.zIndex = '';
        c.classList.remove('dragging', 'drag-over-up', 'drag-over-down');
      });

      setDraggingCardId(null);
      dragInfo.current = null;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [items, save]);

  const handleLinkTouchStart = (e: React.TouchEvent) => {
     linkTouch.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, moved: false };
  };
  const handleLinkTouchMove = (e: React.TouchEvent) => {
    if (!linkTouch.current) return;
    const dx = Math.abs(e.touches[0].clientX - linkTouch.current.startX);
    const dy = Math.abs(e.touches[0].clientY - linkTouch.current.startY);
    if (dx > 5 || dy > 5) linkTouch.current.moved = true;
  };
  const handleLinkTouchEnd = (e: React.TouchEvent) => {
    if (linkTouch.current?.moved) {
      e.preventDefault();
    }
    linkTouch.current = null;
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
          <div id="list-wish" className="grid-area" ref={containerRef}>
            {items.map((c, idx) => {
              const isDragging = draggingCardId === c.id;

              return (
                <div 
                  key={c.id} 
                  className={`card wish-card ${isDragging ? 'dragging' : ''}`}
                  data-idx={idx}
                  data-id={c.id}
                >
                  <div className="cbody" style={{ display: 'flex', padding: 0 }}>
                    <div className="drag-handle" style={{ opacity: isDragging ? 0.6 : 0.25 }}>
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </svg>
                    </div>
                    <div style={{ flex: 1, padding: '12px 12px 12px 4px' }}>
                      <div className="crow-top">
                        <span className="ccheck" onClick={() => onCheck(c.id)}><ICONS.CircleEmpty /></span>
                        <a 
                          className="cname" 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.shop + ' 台北拉麵')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onTouchStart={handleLinkTouchStart}
                          onTouchMove={handleLinkTouchMove}
                          onTouchEnd={handleLinkTouchEnd}
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
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
