import React, { useState, useMemo, useRef } from 'react';
import { useStore } from './store';
import { ICONS, MRT } from './constants';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import LZString from 'lz-string';

export function SharePane() {
  const { state } = useStore();
  
  const [filterType, setFilterType] = useState<'wish' | 'visited'>('visited');
  const [filterStation, setFilterStation] = useState<string>('all');
  const [filterSoup, setFilterSoup] = useState<string>('all');
  const [filterFlavor, setFilterFlavor] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');

  const contentRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Compute the filtered list
  const exportData = useMemo(() => {
    let list = filterType === 'wish' ? state.wish : state.visited;
    if (filterStation !== 'all') list = list.filter(s => s.station === filterStation);
    if (filterSoup !== 'all') {
      list = list.filter(s => s.style === filterSoup || (s.visits && s.visits.some(v => v.style === filterSoup)));
    }
    if (filterFlavor !== 'all') {
      list = list.filter(s => s.season === filterFlavor || (s.visits && s.visits.some(v => v.season === filterFlavor)));
    }
    if (filterRating !== 'all' && filterType === 'visited') {
      const val = Number(filterRating);
      list = list.filter(s => {
        const visits = (s as any).visits || [];
        return visits.some((v: any) => v.rating === val);
      });
    }
    return list;
  }, [state, filterType, filterStation, filterSoup, filterFlavor, filterRating]);

  const uniqueStations = useMemo(() => Array.from(new Set([...state.wish, ...state.visited].map(s => s.station).filter(Boolean))), [state]);

  const uniqueSoups = useMemo(() => {
    const list = [...state.wish, ...state.visited];
    const set = new Set<string>();
    list.forEach(s => {
      if (s.style) set.add(s.style);
      if (s.visits) s.visits.forEach(v => { if (v.style) set.add(v.style); });
    });
    return Array.from(set).sort();
  }, [state]);

  const uniqueFlavors = useMemo(() => {
    const list = [...state.wish, ...state.visited];
    const set = new Set<string>();
    list.forEach(s => {
      if (s.season) set.add(s.season);
      if (s.visits) s.visits.forEach(v => { if (v.season) set.add(v.season); });
    });
    return Array.from(set).sort();
  }, [state]);

  const getMrtColor = (sta: string) => {
    if (!sta) return null;
    const line = MRT.find(l => l.stas.includes(sta));
    return line ? line.c : null;
  };

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
    if (!exportRef.current) return;
    try {
      const canvas = await html2canvas(exportRef.current, { 
        backgroundColor: '#FAF6EE', 
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `ramen-${filterType}.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: '我的拉麵清單',
            });
          } catch (e) {
            // Fallback to download
            const link = document.createElement('a');
            link.download = `ramen-${filterType}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
          }
        } else {
          const link = document.createElement('a');
          link.download = `ramen-${filterType}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      }, 'image/png');
      
      showToast('📸 圖片產生成功！');
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
    // Generate a highly compact structure for sharing
    // Uses indexing for styles and seasons to save space
    const stylesIndex = state.styles;
    const seasonsIndex = state.seasons;

    const compactData = {
      t: filterType,
      s: stylesIndex,
      se: seasonsIndex,
      d: exportData.map(d => {
        let avgRating = "";
        const visits = (d as any).visits || [];
        if (visits.length > 0) {
          avgRating = (visits.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0) / visits.length).toFixed(1);
        }
        
        const styleIdx = stylesIndex.indexOf(d.style || '');
        const seasonIdx = seasonsIndex.indexOf(d.season || '');
        
        let comment = filterType === 'visited' ? visits[visits.length - 1]?.comment : d.comment;
        if (comment && comment.length > 30) comment = comment.substring(0, 30) + '...';

        return [
          d.shop,                     // 0: Name
          d.station || "",            // 1: MRT
          styleIdx > -1 ? styleIdx : (d.style || ""), // 2: Style (index or string)
          seasonIdx > -1 ? seasonIdx : (d.season || ""), // 3: Season (index or string)
          avgRating,                  // 4: Rating
          comment || ""               // 5: Comment
        ];
      })
    };

    const json = JSON.stringify(compactData);
    
    try {
      const payload = LZString.compressToEncodedURIComponent(json);
      const url = `${window.location.origin}${window.location.pathname}?share=${payload}`;

      if (url.length > 7800) {
        showToast('⚠️ 資料量過大，請多利用篩選縮小範圍');
        return;
      }
      
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
      showToast('產生連結失敗');
    }
  };

  return (
    <div className="pane on" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className={`toast ${toastMsg ? 'on' : ''}`}>{toastMsg}</div>
      <div className="grid-area" style={{ background: 'var(--bg-mid)', padding: 16, borderRadius: 16, border: '2px solid var(--bdr)', marginTop: -10, marginLeft: -31 }}>
        <h3 style={{ margin: '0 0 15px 3px', padding: '0', fontSize: 18, fontWeight: 700, color: '#C8442A', textAlign: 'left', lineHeight: '26px' }}>篩選條件</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', width: 70 }}>來源類別</span>
            <div className="fchips" style={{ margin: 0 }}>
              <div className={`fchip ${filterType === 'visited' ? 'on c-visited' : ''}`} style={{ cursor: 'pointer', fontSize: 12, padding: '4px 10px' }} onClick={() => setFilterType('visited')}>已吃清單 ({state.visited.length})</div>
              <div className={`fchip ${filterType === 'wish' ? 'on c-wish' : ''}`} style={{ cursor: 'pointer', fontSize: 12, padding: '4px 10px' }} onClick={() => setFilterType('wish')}>想去清單 ({state.wish.length})</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 3, marginTop: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', width: 70 }}>捷運站</span>
            <select className="fsel" style={{ flex: 1, marginRight: 8, height: 38 }} value={filterStation} onChange={e => setFilterStation(e.target.value)}>
              <option value="all">全部捷運站</option>
              {uniqueStations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', width: 70 }}>湯系</span>
            <select className="fsel" style={{ flex: 1, marginRight: 8, height: 38 }} value={filterSoup} onChange={e => setFilterSoup(e.target.value)}>
              <option value="all">全部湯系</option>
              {uniqueSoups.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', width: 70 }}>調味</span>
            <select className="fsel" style={{ flex: 1, marginRight: 8, height: 38 }} value={filterFlavor} onChange={e => setFilterFlavor(e.target.value)}>
              <option value="all">全部調味</option>
              {uniqueFlavors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', width: 70 }}>星級</span>
            <select className="fsel" style={{ flex: 1, marginRight: 8, height: 38 }} value={filterRating} onChange={e => setFilterRating(e.target.value)}>
              <option value="all">全部星級</option>
              <option value="5">5 顆星 ★★★★★</option>
              <option value="4">4 顆星 ★★★★</option>
              <option value="3">3 顆星 ★★★</option>
              <option value="2">2 顆星 ★★</option>
              <option value="1">1 顆星 ★</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid-area" style={{ background: 'var(--bg-mid)', padding: 16, borderRadius: 16, border: '2px solid var(--bdr)', marginTop: -24 }}>
        <h3 style={{ margin: '0 0 12px 3px', padding: '0', fontSize: 18, fontWeight: 700, color: '#C8442A', lineHeight: '25px' }}>預覽匯出結果</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {exportData.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#888', background: '#f0f0f0', borderRadius: 8 }}>沒找到符合條件的拉麵店。</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {exportData.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', border: '2px solid #1a1a1a', borderRadius: 12, padding: 12, background: '#fff' }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{item.shop}</span>
                    {filterType === 'visited' && item.visits && item.visits.length > 0 && (
                      <span style={{ fontSize: 14, fontWeight: 'normal', color: '#d92c2c' }}>★ {(item.visits.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0) / item.visits.length).toFixed(1)}</span>
                    )}
                  </div>
                    <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#444', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 26, padding: '0 10px', background: 'var(--yellow-lt)', color: '#8A6900', borderRadius: 13, border: '1px solid rgba(245,200,66,0.38)', lineHeight: '26px', gap: 4 }}>
                        {getMrtColor(item.station) ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: getMrtColor(item.station)! }} /> : '🚇'} {item.station || '—'}
                      </div>
                      {(item.style || (item.visits && item.visits[0]?.style)) && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 26, padding: '0 10px', background: 'var(--purple-lt)', color: 'var(--purple)', borderRadius: 13, border: '1px solid rgba(124,92,191,0.28)', lineHeight: '26px' }}>
                          {item.style || item.visits[0]?.style}
                        </div>
                      )}
                      {(item.season || (item.visits && item.visits[0]?.season)) && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 26, padding: '0 10px', background: 'var(--blue-lt)', color: 'var(--blue)', borderRadius: 13, border: '1px solid rgba(74,142,194,0.28)', lineHeight: '26px' }}>
                          {item.season || item.visits[0]?.season}
                        </div>
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

      <div className="grid-area" style={{ background: 'var(--bg-mid)', padding: 16, borderRadius: 16, border: '2px solid var(--bdr)', marginTop: -10 }}>
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

      {/* Invisible container for high-quality export */}
      <div className="export-canvas-container" ref={exportRef}>
        <div className="export-header">
           <span className="logo-icon">🍜</span>
           <span className="export-logo-text">拉麵<em>です</em></span>
        </div>
        <div style={{ marginBottom: 16 }}>
           <h2 style={{ fontSize: 18, fontWeight: 800 }}>
             {filterType === 'wish' ? '🍜 想去的拉麵清單' : '✅ 已經吃過的拉麵清單'}
           </h2>
           <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
             篩選：{filterStation !== 'all' ? filterStation : '不限'}, {filterSoup !== 'all' ? filterSoup : '不限'}
           </p>
        </div>
        
        {exportData.map((item: any) => (
          <div key={item.id} className="export-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="export-shop">{item.shop}</div>
              {filterType === 'visited' && item.visits && item.visits.length > 0 && (
                <div style={{ color: 'var(--red)', fontSize: 13, fontWeight: 'bold' }}>
                  ★ {(item.visits.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0) / item.visits.length).toFixed(1)}
                </div>
              )}
            </div>
            <div className="export-meta" style={{ marginTop: -2 }}>
              <span className="export-tag sta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {getMrtColor(item.station) ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: getMrtColor(item.station)! }} /> : '🚇'} {item.station || '—'}
              </span>
              {(item.style || (item.visits && item.visits[0]?.style)) && (
                <span className="export-tag sty">{item.style || item.visits[0]?.style}</span>
              )}
              {(item.season || (item.visits && item.visits[0]?.season)) && (
                <span className="export-tag sea">{item.season || item.visits[0]?.season}</span>
              )}
            </div>
            {((filterType === 'visited' && item.visits?.[item.visits.length - 1]?.comment) || item.comment) && (
              <div style={{ marginTop: 8, fontSize: 11, color: '#555', background: '#f9f9f9', padding: '6px 8px', borderRadius: 6, opacity: 0.8 }}>
                💬 {filterType === 'visited' ? item.visits![item.visits!.length - 1].comment : item.comment}
              </div>
            )}
          </div>
        ))}

        <div className="export-watermark">
          GENERATE BY RAMEN-DESU · {new Date().toLocaleDateString('zh-TW')}
        </div>
      </div>

      {/* Hidden container for rendering export content cleanly (Old PDF one) */}
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
            {filterRating !== 'all' && <span>★ {filterRating}</span>}
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, padding: '0 12px', background: 'var(--yellow-lt)', color: '#8A6900', borderRadius: 14, border: '1px solid rgba(245,200,66,0.38)', lineHeight: '28px' }}>🚇 {item.station || '—'}</div>
                      {(item.style || (item.visits && item.visits[0]?.style)) && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, padding: '0 12px', background: 'var(--purple-lt)', color: 'var(--purple)', borderRadius: 14, border: '1px solid rgba(124,92,191,0.28)', lineHeight: '28px' }}>
                          {item.style || item.visits[0]?.style}
                        </div>
                      )}
                      {(item.season || (item.visits && item.visits[0]?.season)) && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, padding: '0 12px', background: 'var(--blue-lt)', color: 'var(--blue)', borderRadius: 14, border: '1px solid rgba(74,142,194,0.28)', lineHeight: '28px' }}>
                          {item.season || item.visits[0]?.season}
                        </div>
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
