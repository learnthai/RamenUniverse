import React, { useEffect, useState } from 'react';

export function ShareViewer({ dataString, onClose }: { dataString: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(dataString)));
      setData(decoded);
    } catch (e) {
      console.error(e);
      alert('無效的分享連結');
      onClose();
    }
  }, [dataString, onClose]);

  if (!data) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fcfcfc', zIndex: 9999, overflowY: 'auto', padding: 24, paddingBottom: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={() => window.location.href = '/'} style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 20, fontWeight: 'bold', cursor: 'pointer' }}>
          查看其他拉麵清單
        </button>
      </div>

      <h1 style={{ fontSize: 24, margin: '0 0 8px', borderBottom: '3px solid #1a1a1a', paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#d92c2c' }}>🍜</span> 
        分享的{data.list === 'wish' ? '想去' : '已吃'}拉麵清單
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: 24 }}>
        {data.data.map((item: any, i: number) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', border: '2px solid #1a1a1a', borderRadius: 12, padding: 16, background: '#fff' }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{item.n}</span>
              {data.list === 'visited' && item.r !== undefined && (
                <span style={{ fontSize: 14, fontWeight: 'normal', color: '#d92c2c' }}>★ {item.r}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#444', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', background: '#e0e0e0', borderRadius: 12, lineHeight: '1.2' }}>{item.s}</div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', background: '#e0e0e0', borderRadius: 12, lineHeight: '1.2' }}>{item.sp}</div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', background: '#e0e0e0', borderRadius: 12, lineHeight: '1.2' }}>{item.f}</div>
              {data.list === 'visited' && item.v !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', background: '#ffefef', color: '#d92c2c', borderRadius: 12, lineHeight: '1.2' }}>吃過 {item.v} 次</div>
              )}
            </div>
          </div>
        ))}
        {data.data.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: '#888', background: '#f0f0f0', borderRadius: 8, gridColumn: '1 / -1' }}>
            這份清單沒有任何拉麵...
          </div>
        )}
      </div>
    </div>
  );
}
