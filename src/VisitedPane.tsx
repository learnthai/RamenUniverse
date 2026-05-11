import React, { useState, useMemo } from 'react';
import { RamenCard, Visit } from './types';
import { ICONS, MRT } from './constants';

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
    style: '湯系',
    season: '調味',
    rating: '星級'
  };

  const getOptions = (type: string) => {
    const set = new Set<string>();
    if (type === 'station') {
      visited.forEach(c => { if (c.station) set.add(c.station); });
    }
    if (type === 'shop') {
      visited.forEach(c => { if (c.shop) set.add(c.shop); });
    }
    if (type === 'style') {
      visited.forEach(c => {
        if (c.style) set.add(c.style);
        if (c.visits) c.visits.forEach(v => { if (v.style) set.add(v.style); });
      });
    }
    if (type === 'season') {
      visited.forEach(c => {
        if (c.season) set.add(c.season);
        if (c.visits) c.visits.forEach(v => { if (v.season) set.add(v.season); });
      });
    }
    if (type === 'rating') {
      return ['5', '4', '3', '2', '1'];
    }
    return Array.from(set).sort();
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
      if (filterType === 'style') res = res.filter(c => c.style === filterValue || (c.visits && c.visits.some(v => v.style === filterValue)));
      if (filterType === 'season') res = res.filter(c => c.season === filterValue || (c.visits && c.visits.some(v => v.season === filterValue)));
      if (filterType === 'rating') {
        const val = Number(filterValue);
        res = res.filter(c => {
          const visits = c.visits && c.visits.length > 0 ? c.visits : [];
          if (visits.length === 0) return (c.rating || 0) === val;
          return visits.some(v => v.rating === val);
        });
      }
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

  const getMrtColor = (sta: string) => {
    if (!sta) return null;
    const line = MRT.find(l => l.stas.includes(sta));
    return line ? line.c : null;
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
                      {c.station && (
                        <span className="ctag sta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {getMrtColor(c.station) ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: getMrtColor(c.station)! }} /> : '🚇'} {c.station}
                        </span>
                      )}
                    </div>
                    <div className="visits-wrap">
                      {visits.map((v, idx) => (
                        <div key={idx} className="visit-entry">
                          <div className="ve-top">
                            <Stars num={v.rating} />
                            <div className="ve-item" style={{display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap'}}>
                              {v.item || '—'}
                              <div style={{display: 'flex', gap: 4, flexWrap: 'wrap'}}>
                                {v.style && <span className="ve-tag" style={{background: 'var(--purple-lt)', color: 'var(--purple)', border: '1px solid rgba(124,92,191,0.28)'}}>{v.style}</span>}
                                {v.season && <span className="ve-tag">{v.season}</span>}
                              </div>
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
