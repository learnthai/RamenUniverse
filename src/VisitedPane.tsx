import React, { useState, useMemo } from 'react';
import { RamenCard, Visit } from './types';
import { ICONS } from './constants';

interface VisitedPaneProps {
  visited: RamenCard[];
  onAddVisit: (cardId: string) => void;
  onEditCard: (cardId: string) => void;
  onDelCard: (cardId: string) => void;
  onEditVisit: (cardId: string, visitIdx: number) => void;
  onDelVisit: (cardId: string, visitIdx: number) => void;
}

export function VisitedPane({ visited, onAddVisit, onEditCard, onDelCard, onEditVisit, onDelVisit }: VisitedPaneProps) {
  const [q, setQ] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string | null>(null);

  const filterLabels: Record<string, string> = {
    station: '捷運站',
    shop: '店家',
    style: '系別',
    season: '調味'
  };

  const getOptions = (type: string) => {
    let opts: string[] = [];
    if (type === 'station') opts = [...new Set(visited.map(c => c.station).filter(Boolean) as string[])];
    if (type === 'shop') opts = [...new Set(visited.map(c => c.shop))];
    if (type === 'style') opts = [...new Set(visited.map(c => c.style).filter(Boolean) as string[])];
    if (type === 'season') {
      const sea = visited.flatMap(c => (c.visits || []).map(v => v.season).filter(Boolean) as string[]);
      opts = [...new Set(sea)];
    }
    return opts.sort();
  };

  const items = useMemo(() => {
    let res = visited;
    if (q) {
      const ql = q.toLowerCase();
      res = res.filter(c => 
        c.shop.toLowerCase().includes(ql) || 
        (c.station || '').includes(q)
      );
    }
    if (filterValue && filterType) {
      if (filterType === 'station') res = res.filter(c => c.station === filterValue);
      if (filterType === 'shop') res = res.filter(c => c.shop === filterValue);
      if (filterType === 'style') res = res.filter(c => c.style === filterValue);
      if (filterType === 'season') res = res.filter(c => (c.visits || []).some(v => v.season === filterValue));
    }
    return res;
  }, [visited, q, filterType, filterValue]);

  const toggleFilter = (type: string) => {
    if (filterType === type) {
      setFilterType(null);
      setFilterValue(null);
    } else {
      setFilterType(type);
    }
  };

  const Stars = ({ num }: { num: number }) => (
    <div className="ve-stars">
      {[1,2,3,4,5].map(i => <span key={i} className={`ve-star ${i <= num ? 'on' : ''}`}>{i <= num ? '★' : '☆'}</span>)}
    </div>
  );

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

      <div className="filter-bar" style={{ paddingLeft: 41 }}>
        {Object.entries(filterLabels).map(([key, label]) => (
          <button 
            key={key}
            className={`fbtn ${filterType === key ? 'on-vis' : ''}`} 
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
            <div className="fp-chip sel" onClick={() => setFilterValue(null)}>
              {filterValue}
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="grid-area">
          <div className="empty">
            <div className="empty-ico" style={{ display: 'flex', justifyContent: 'center' }}>
              {q || filterValue ? <ICONS.SearchBig /> : <ICONS.CheckBig />}
            </div>
            <h3>{q || filterValue ? '沒有符合的結果' : '還沒有吃過的記錄'}</h3>
            <p>{q || filterValue ? '' : '在想去清單點圈圈標記已吃或直接新增到已吃清單！'}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="sec-lbl">
            <span className="sl-txt">VISITED</span>
            <span className="sec-line"></span>
            <span className="sec-cnt">{items.length} 間</span>
          </div>
          <div className="grid-area">
            {items.map(c => {
              const visits = c.visits && c.visits.length > 0 ? c.visits : [{ item: c.item || '', rating: c.rating || 0, comment: c.comment || '', season: c.season || '', style: c.style || '', id: c.id }];
              return (
                <div key={c.id} className="card visited">
                  <div className="cbody">
                    <div className="crow-top">
                      <span className="ccheck" style={{cursor: 'default'}}><ICONS.CircleFilled /></span>
                      <a className="cname" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.shop + ' 台北拉麵')}`} target="_blank" rel="noopener noreferrer">{c.shop}</a>
                      <div className="cactions">
                        <div className="cact edit" onClick={(e) => { e.stopPropagation(); onEditCard(c.id); }}><ICONS.Edit /></div>
                        <div className="cact del" onClick={(e) => { e.stopPropagation(); onDelCard(c.id); }}><ICONS.Delete /></div>
                      </div>
                    </div>
                    <div className="ctags">
                      {c.style && <span className="ctag sty">{c.style}</span>}
                      {c.station && <span className="ctag sta">🚇 {c.station}</span>}
                    </div>
                    <div className="visits-wrap">
                      {visits.map((v, idx) => (
                        <div key={idx} className="visit-entry">
                          <div className="ve-top">
                            <Stars num={v.rating} />
                            <div className="ve-item" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                              {v.item || '—'}
                              {v.season && <span className="ve-tag">{v.season}</span>}
                            </div>
                          </div>
                          {v.comment && <div className="ve-comment">「{v.comment}」</div>}
                          <div className="ve-actions">
                            <div className="ve-act edit" onClick={(e) => { e.stopPropagation(); onEditVisit(c.id, idx); }}><ICONS.Edit /></div>
                            <div className="ve-act del" onClick={(e) => { e.stopPropagation(); onDelVisit(c.id, idx); }}><ICONS.Delete /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="cfoot">
                      <button style={{fontFamily:'var(--jp)', fontSize:11, background:'var(--green-lt)', color:'var(--green)', border:'1px solid var(--green-mid)', borderRadius:'var(--pill)', padding:'4px 12px', cursor:'pointer'}} onClick={() => onAddVisit(c.id)}>
                        ＋ 再訪記錄
                      </button>
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
