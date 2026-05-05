import React, { useState, useMemo, useRef } from 'react';
import { useStore } from './store';
import { ICONS } from './constants';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function SharePane() {
  const { state } = useStore();
  
  const [filterType, setFilterType] = useState<'wish' | 'visited'>('wish');
  const [filterStation, setFilterStation] = useState<string>('all');
  const [filterSoup, setFilterSoup] = useState<string>('all');
  const [filterFlavor, setFilterFlavor] = useState<string>('all');

  const contentRef = useRef<HTMLDivElement>(null);

  // Compute the filtered list
  const exportData = useMemo(() => {
    let list = filterType === 'wish' ? state.wish : state.visited;
    if (filterStation !== 'all') list = list.filter(s => s.station === filterStation);
    if (filterSoup !== 'all') list = list.filter(s => s.style === filterSoup);
    if (filterFlavor !== 'all') list = list.filter(s => s.season === filterFlavor);
    return list;
  }, [state, filterType, filterStation, filterSoup, filterFlavor]);

  const uniqueStations = useMemo(() => Array.from(new Set((filterType === 'wish' ? state.wish : state.visited).map(s => s.station).filter(Boolean))), [state, filterType]);

  const uniqueSoups = useMemo(() => {
    let list = filterType === 'wish' ? state.wish : state.visited;
    if (filterStation !== 'all') list = list.filter(s => s.station === filterStation);
    return Array.from(new Set(list.map(s => s.style).filter(Boolean)));
  }, [state, filterType, filterStation]);

  const uniqueFlavors = useMemo(() => {
    let list = filterType === 'wish' ? state.wish : state.visited;
    if (filterStation !== 'all') list = list.filter(s => s.station === filterStation);
    if (filterSoup !== 'all') list = list.filter(s => s.style === filterSoup);
    return Array.from(new Set(list.map(s => s.season).filter(Boolean)));
  }, [state, filterType, filterStation, filterSoup]);

  React.useEffect(() => {
    if (filterSoup !== 'all' && !uniqueSoups.includes(filterSoup)) setFilterSoup('all');
  }, [uniqueSoups, filterSoup]);

  React.useEffect(() => {
    if (filterFlavor !== 'all' && !uniqueFlavors.includes(filterFlavor)) setFilterFlavor('all');
  }, [uniqueFlavors, filterFlavor]);

  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleExportJPG = async () => {
    if (!contentRef.current) return;
    try {
      const canvas = await html2canvas(contentRef.current, { backgroundColor: '#fcfcfc', scale: 2, windowWidth: 800 });
      const link = document.createElement('a');
      link.download = `ramen-${filterType}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } catch (err) {
      console.error(err);
      alert('匯出圖片失敗');
    }
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    try {
      const canvas = await html2canvas(contentRef.current, { backgroundColor: '#fcfcfc', scale: 2, windowWidth: 800 });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ramen-${filterType}.pdf`);
    } catch (err) {
      console.error(err);
      alert('匯出PDF失敗');
    }
  };

  const handleExportLink = async () => {
    // Generate a encoded URL with current state to share
    const data = JSON.stringify({
      list: filterType,
      data: exportData.map(d => {
        let avgRating = undefined;
        if ((d as any).visits && (d as any).visits.length > 0) {
          avgRating = ((d as any).visits.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0) / (d as any).visits.length).toFixed(1);
        }
        return {
          n: d.shop,
          s: d.station,
          sp: d.style,
          f: d.season,
          r: avgRating,
          v: (d as any).visits?.length
        };
      })
    });
    
    // Simple compression via base64
    try {
      const payload = btoa(encodeURIComponent(data));
      const url = `${window.location.origin}${window.location.pathname}?share=${payload}`;
      
      const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
      const resJson = await res.json();
      if (resJson.shorturl) {
        navigator.clipboard.writeText(resJson.shorturl);
        showToast('已複製縮短後的頁面連結！');
      } else {
        navigator.clipboard.writeText(url);
        showToast('短網址服務暫時失效，已複製完整連結！');
      }
    } catch (e) {
      showToast('無法產生連結資料過大');
    }
  };

  return (
    <div className="pane on" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className={`toast ${toastMsg ? 'on' : ''}`}>{toastMsg}</div>
      <div className="grid-area" style={{ background: 'var(--bg-mid)', padding: 16, borderRadius: 16, border: '2px solid var(--bdr)' }}>
        <h3 style={{ margin: '0 0 15px 3px', padding: '0', fontSize: 18, fontWeight: 700, color: '#C8442A', textAlign: 'left', lineHeight: '26px' }}>篩選條件</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', width: 60 }}>來源類別</span>
            <div className="fchips" style={{ margin: 0 }}>
              <div className={`fchip ${filterType === 'wish' ? 'on c-wish' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilterType('wish')}>想去清單 ({state.wish.length})</div>
              <div className={`fchip ${filterType === 'visited' ? 'on c-visited' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilterType('visited')}>已吃清單 ({state.visited.length})</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 3, marginTop: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', width: 60 }}>捷運站</span>
            <select className="inp" style={{ flex: 1, padding: '8px 12px 8px 12px', border: '1.5px solid var(--gray-mid)', borderRadius: 5, background: '#fff', marginLeft: 0, marginRight: 30 }} value={filterStation} onChange={e => setFilterStation(e.target.value)}>
              <option value="all">全部捷運站</option>
              {uniqueStations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', width: 60 }}>湯系</span>
            <select className="inp" style={{ flex: 1, padding: '8px 12px', border: '1.5px solid var(--gray-mid)', borderRadius: 5, background: '#fff', marginRight: 30 }} value={filterSoup} onChange={e => setFilterSoup(e.target.value)}>
              <option value="all">全部湯系</option>
              {uniqueSoups.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', width: 60 }}>調味</span>
            <select className="inp" style={{ flex: 1, padding: '8px 12px', border: '1.5px solid var(--gray-mid)', borderRadius: 5, background: '#fff', marginRight: 30 }} value={filterFlavor} onChange={e => setFilterFlavor(e.target.value)}>
              <option value="all">全部調味</option>
              {uniqueFlavors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid-area" style={{ background: 'var(--bg-mid)', padding: 16, borderRadius: 16, border: '2px solid var(--bdr)' }}>
        <h3 style={{ margin: '0 0 16px 3px', padding: '0', fontSize: 18, fontWeight: 700, color: '#C8442A', lineHeight: '25px' }}>預覽匯出結果</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {exportData.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#888', background: '#f0f0f0', borderRadius: 8 }}>沒找到符合條件的拉麵店。</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {exportData.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', border: '2px solid #1a1a1a', borderRadius: 12, padding: 12, background: '#fff' }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{item.shop}</span>
                    {filterType === 'visited' && item.visits && item.visits.length > 0 && (
                      <span style={{ fontSize: 14, fontWeight: 'normal', color: '#d92c2c' }}>★ {(item.visits.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0) / item.visits.length).toFixed(1)}</span>
                    )}
                  </div>
                    <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#444', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 26, padding: '0 10px', background: 'var(--yellow-lt)', color: '#8A6900', borderRadius: 13, border: '1px solid rgba(245,200,66,0.38)', lineHeight: '26px' }}>🚇 {item.station}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 26, padding: '0 10px', background: 'var(--purple-lt)', color: 'var(--purple)', borderRadius: 13, border: '1px solid rgba(124,92,191,0.28)', lineHeight: '26px' }}>{item.style}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 26, padding: '0 10px', background: 'var(--blue-lt)', color: 'var(--blue)', borderRadius: 13, border: '1px solid rgba(74,142,194,0.28)', lineHeight: '26px' }}>{item.season}</div>
                      {filterType === 'visited' && item.visits && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 26, padding: '0 10px', background: '#ffefef', color: '#d92c2c', borderRadius: 13, border: '1px solid #f5b7b1', lineHeight: '26px' }}>吃過 {item.visits.length} 次</div>
                      )}
                    </div>
                    {((filterType === 'visited' && item.visits?.[item.visits.length - 1]?.comment) || item.comment) && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#666', background: '#f9f9f9', padding: '6px 8px', borderRadius: 6, borderLeft: '3px solid #eee' }}>
                        💬 {filterType === 'visited' ? item.visits![item.visits!.length - 1].comment : item.comment}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid-area" style={{ background: 'var(--bg-mid)', padding: 16, borderRadius: 16, border: '2px solid var(--bdr)' }}>
        <h3 style={{ margin: '0 0 16px 3px', padding: '0', fontSize: 18, fontWeight: 700, color: '#C8442A', lineHeight: '25px' }}>決定匯出格式</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="sbtn" style={{ flex: 1, minWidth: 80, padding: 12, background: 'var(--bg)', color: '#e4c111' }} onClick={handleExportJPG}>
            JPG 圖片
          </button>
          <button className="sbtn" style={{ flex: 1, minWidth: 80, padding: 12, background: 'var(--bg)', color: '#c87cf9' }} onClick={handleExportPDF}>
            PDF 文件
          </button>
          <button className="sbtn" style={{ flex: 1, minWidth: 80, padding: 12, background: 'var(--bg)', color: '#2A6040' }} onClick={handleExportLink}>
            頁面連結
          </button>
        </div>
      </div>

      {/* Hidden container for rendering export content cleanly */}
      <div style={{ position: 'absolute', top: -9999, left: -9999, width: 800, padding: 20 }}>
        <div ref={contentRef} style={{ background: '#fcfcfc', color: '#1a1a1a', padding: 40, fontFamily: 'sans-serif', zIndex: -1 }}>
          <h1 style={{ fontSize: 32, margin: '0 0 8px', borderBottom: '3px solid #1a1a1a', paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#d92c2c' }}>🍜</span> 
            {filterType === 'wish' ? '想去的拉麵清單' : '已經吃過的拉麵清單'}
          </h1>
          
          <div style={{ display: 'flex', gap: 12, margin: '0 0 24px', fontSize: 14, color: '#666' }}>
            {filterStation !== 'all' && <span>📍 {filterStation}</span>}
            {filterSoup !== 'all' && <span>🍲 {filterSoup}</span>}
            {filterFlavor !== 'all' && <span>🧂 {filterFlavor}</span>}
            <span>共 {exportData.length} 間</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {exportData.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#888', background: '#f0f0f0', borderRadius: 8 }}>沒找到符合條件的拉麵店。</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {exportData.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', border: '2px solid #1a1a1a', borderRadius: 12, padding: 16, background: '#fff' }}>
                    <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{item.shop}</span>
                      {filterType === 'visited' && item.visits && item.visits.length > 0 && (
                        <span style={{ fontSize: 14, fontWeight: 'normal', color: '#d92c2c' }}>★ {(item.visits.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0) / item.visits.length).toFixed(1)}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#444', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, padding: '0 12px', background: 'var(--yellow-lt)', color: '#8A6900', borderRadius: 14, border: '1px solid rgba(245,200,66,0.38)', lineHeight: '28px' }}>🚇 {item.station}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, padding: '0 12px', background: 'var(--purple-lt)', color: 'var(--purple)', borderRadius: 14, border: '1px solid rgba(124,92,191,0.28)', lineHeight: '28px' }}>{item.style}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, padding: '0 12px', background: 'var(--blue-lt)', color: 'var(--blue)', borderRadius: 14, border: '1px solid rgba(74,142,194,0.28)', lineHeight: '28px' }}>{item.season}</div>
                      {filterType === 'visited' && item.visits && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, padding: '0 12px', background: '#ffefef', color: '#d92c2c', borderRadius: 14, border: '1px solid #f5b7b1', lineHeight: '28px' }}>吃過 {item.visits.length} 次</div>
                      )}
                    </div>
                    {((filterType === 'visited' && item.visits?.[item.visits.length - 1]?.comment) || item.comment) && (
                      <div style={{ marginTop: 10, fontSize: 13, color: '#555', background: '#f5f5f5', padding: '8px 12px', borderRadius: 8, borderLeft: '4px solid #ddd' }}>
                        💬 {filterType === 'visited' ? item.visits![item.visits!.length - 1].comment : item.comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ marginTop: 40, textAlign: 'center', fontSize: 12, color: '#999', borderTop: '1px solid #ddd', paddingTop: 16 }}>
            由「拉麵です」產生 {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

    </div>
  );
}
