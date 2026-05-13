import React, { useEffect, useState } from 'react';
import LZString from 'lz-string';

export function ShareViewer({ dataString, onClose }: { dataString: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    try {
      let decodedJson = "";
      // Try LZString (new format) first
      const decompressed = LZString.decompressFromEncodedURIComponent(dataString);
      if (decompressed && decompressed.startsWith('{')) {
        decodedJson = decompressed;
      } else {
        // Fallback to old format (Base64)
        decodedJson = decodeURIComponent(atob(dataString));
      }
      
      const decoded = JSON.parse(decodedJson);
      setData(decoded);
    } catch (e) {
      console.error(e);
      alert('無效的分享連結或連結已損毀');
      onClose();
    }
  }, [dataString, onClose]);

  if (!data) return null;

  const getStyleVal = (val: any) => {
    if (typeof val === 'number' && data.s && data.s[val]) return data.s[val];
    return val;
  };
  const getSeasonVal = (val: any) => {
    if (typeof val === 'number' && data.se && data.se[val]) return data.se[val];
    return val;
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fcfcfc', zIndex: 9999, overflowY: 'auto', padding: 24, paddingBottom: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        {data.u ? (
          <a href={`/?shareId=${data.u}`} style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 30, fontWeight: 'bold', cursor: 'pointer', fontSize: 16, boxShadow: 'var(--shadow-sm)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            ← 返回清單 (唯讀模式)
          </a>
        ) : (
          <a href={window.location.href} style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 30, fontWeight: 'bold', cursor: 'pointer', fontSize: 16, boxShadow: 'var(--shadow-sm)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            ← 返回清單 (唯讀模式)
          </a>
        )}
      </div>

      <h1 style={{ fontSize: 24, margin: '0 0 8px', borderBottom: '3px solid #1a1a1a', paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#d92c2c' }}>🍜</span> 
        分享的{(data.t || data.list) === 'wish' ? '想去' : '已吃'}拉麵清單
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: 24 }}>
        {data.d.map((row: any[], i: number) => {
          // Format based on the new array-based row or old object-based structure (for backward compatibility if needed)
          const isArray = Array.isArray(row);
          const item = isArray ? {
            n: row[0],
            s: row[1],
            sp: getStyleVal(row[2]),
            f: getSeasonVal(row[3]),
            r: row[4],
            c: row[5]
          } : row;

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', border: '2px solid #1a1a1a', borderRadius: 12, padding: 16, background: '#fff' }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{item.n}</span>
                {(data.t || data.list) === 'visited' && item.r !== undefined && item.r !== "" && (
                  <span style={{ fontSize: 14, fontWeight: 'normal', color: '#d92c2c' }}>★ {item.r}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#444', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, padding: '0 12px', background: 'var(--yellow-lt)', color: '#8A6900', borderRadius: 14, border: '1px solid rgba(245,200,66,0.38)', lineHeight: '28px' }}>🚇 {item.s || '—'}</div>
                {item.sp && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, padding: '0 12px', background: 'var(--purple-lt)', color: 'var(--purple)', borderRadius: 14, border: '1px solid rgba(124,92,191,0.28)', lineHeight: '28px' }}>{item.sp}</div>}
                {item.f && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, padding: '0 12px', background: 'var(--blue-lt)', color: 'var(--blue)', borderRadius: 14, border: '1px solid rgba(74,142,194,0.28)', lineHeight: '28px' }}>{item.f}</div>}
              </div>
              {item.c && (
                <div style={{ marginTop: 10, fontSize: 13, color: '#555', background: '#f5f5f5', padding: '8px 12px', borderRadius: 8, borderLeft: '4px solid #ddd' }}>
                  💬 {item.c}
                </div>
              )}
            </div>
          );
        })}
        {data.d.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: '#888', background: '#f0f0f0', borderRadius: 8, gridColumn: '1 / -1' }}>
            這份清單沒有任何拉麵...
          </div>
        )}
      </div>
    </div>
  );
}
