import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useStore } from './store';
import { ICONS } from './constants';

const STATION_COORDS: Record<string, { x: number; y: number; lines: string[] }> = {
  "淡水": {
    x: 16,
    y: 6.8,
    lines: [
      "red"
    ]
  },
  "北投": {
    x: 25.5,
    y: 21.6,
    lines: [
      "red"
    ]
  },
  "士林": {
    x: 41.2,
    y: 33.1,
    lines: [
      "red"
    ]
  },
  "劍潭": {
    x: 39.8,
    y: 37,
    lines: [
      "red"
    ]
  },
  "圓山": {
    x: 41,
    y: 40.5,
    lines: [
      "red"
    ]
  },
  "民權西路": {
    x: 41,
    y: 44,
    lines: [
      "red",
      "orange"
    ]
  },
  "雙連": {
    x: 41.2,
    y: 48.1,
    lines: [
      "red"
    ]
  },
  "中山": {
    x: 41.1,
    y: 52,
    lines: [
      "red",
      "green"
    ]
  },
  "北車": {
    x: 40.1,
    y: 58.1,
    lines: [
      "red",
      "blue"
    ]
  },
  "台北車站": {
    x: 39.5,
    y: 57.4,
    lines: [
      "red",
      "blue"
    ]
  },
  "台大醫院": {
    x: 41,
    y: 61,
    lines: [
      "red"
    ]
  },
  "中正紀念堂": {
    x: 41,
    y: 65.5,
    lines: [
      "red",
      "green"
    ]
  },
  "東門": {
    x: 48.8,
    y: 65.5,
    lines: [
      "red",
      "orange"
    ]
  },
  "大安森林公園": {
    x: 55.5,
    y: 65.5,
    lines: [
      "red"
    ]
  },
  "大安": {
    x: 61.3,
    y: 65.8,
    lines: [
      "red",
      "brown"
    ]
  },
  "信義安和": {
    x: 68.3,
    y: 65.4,
    lines: [
      "red"
    ]
  },
  "台北101": {
    x: 74.8,
    y: 65.5,
    lines: [
      "red"
    ]
  },
  "台北101/世貿": {
    x: 74.8,
    y: 65.5,
    lines: [
      "red"
    ]
  },
  "象山": {
    x: 81,
    y: 65.5,
    lines: [
      "red"
    ]
  },
  "頂埔": {
    x: 21,
    y: 94,
    lines: [
      "blue"
    ]
  },
  "永寧": {
    x: 21,
    y: 90.5,
    lines: [
      "blue"
    ]
  },
  "府中": {
    x: 21,
    y: 75,
    lines: [
      "blue"
    ]
  },
  "板橋": {
    x: 21.1,
    y: 73.4,
    lines: [
      "blue",
      "yellow"
    ]
  },
  "新埔": {
    x: 21,
    y: 65.8,
    lines: [
      "blue"
    ]
  },
  "江子翠": {
    x: 27.5,
    y: 64.5,
    lines: [
      "blue"
    ]
  },
  "龍山寺": {
    x: 31.5,
    y: 60.5,
    lines: [
      "blue"
    ]
  },
  "西門": {
    x: 33.9,
    y: 58,
    lines: [
      "blue",
      "green"
    ]
  },
  "善導寺": {
    x: 48.5,
    y: 58,
    lines: [
      "blue"
    ]
  },
  "忠孝新生": {
    x: 51.3,
    y: 58,
    lines: [
      "blue",
      "orange"
    ]
  },
  "忠孝復興": {
    x: 61.6,
    y: 58.1,
    lines: [
      "blue",
      "brown"
    ]
  },
  "忠孝敦化": {
    x: 68.5,
    y: 58,
    lines: [
      "blue"
    ]
  },
  "敦化": {
    x: 68.5,
    y: 58,
    lines: [
      "blue"
    ]
  },
  "國父紀念館": {
    x: 75,
    y: 58,
    lines: [
      "blue"
    ]
  },
  "國館": {
    x: 75,
    y: 58,
    lines: [
      "blue"
    ]
  },
  "市政府": {
    x: 81.5,
    y: 58,
    lines: [
      "blue"
    ]
  },
  "南港": {
    x: 93.5,
    y: 53.5,
    lines: [
      "blue"
    ]
  },
  "松山": {
    x: 81,
    y: 52.3,
    lines: [
      "green"
    ]
  },
  "南京三民": {
    x: 75,
    y: 52.3,
    lines: [
      "green"
    ]
  },
  "台北小巨蛋": {
    x: 68.3,
    y: 52.3,
    lines: [
      "green"
    ]
  },
  "南京復興": {
    x: 61.4,
    y: 52.1,
    lines: [
      "green",
      "brown"
    ]
  },
  "松江南京": {
    x: 52.1,
    y: 51.8,
    lines: [
      "green",
      "orange"
    ]
  },
  "北門": {
    x: 35.8,
    y: 50.5,
    lines: [
      "green"
    ]
  },
  "小南門": {
    x: 35.8,
    y: 65.5,
    lines: [
      "green"
    ]
  },
  "古亭": {
    x: 45,
    y: 69.5,
    lines: [
      "green",
      "orange"
    ]
  },
  "台電大樓": {
    x: 49,
    y: 72,
    lines: [
      "green"
    ]
  },
  "公館": {
    x: 52.8,
    y: 74.5,
    lines: [
      "green"
    ]
  },
  "萬隆": {
    x: 56.5,
    y: 78,
    lines: [
      "green"
    ]
  },
  "景美": {
    x: 59.5,
    y: 81,
    lines: [
      "green"
    ]
  },
  "迴龍": {
    x: 7.4,
    y: 75.5,
    lines: [
      "orange"
    ]
  },
  "輔大": {
    x: 5.8,
    y: 67.5,
    lines: [
      "orange"
    ]
  },
  "新莊": {
    x: 6.3,
    y: 63.5,
    lines: [
      "orange"
    ]
  },
  "先嗇宮": {
    x: 14.4,
    y: 55.5,
    lines: [
      "orange"
    ]
  },
  "三重": {
    x: 18,
    y: 52,
    lines: [
      "orange",
      "purple"
    ]
  },
  "菜寮": {
    x: 21.5,
    y: 49,
    lines: [
      "orange"
    ]
  },
  "台北橋": {
    x: 25,
    y: 46.5,
    lines: [
      "orange"
    ]
  },
  "大橋頭": {
    x: 32,
    y: 44.8,
    lines: [
      "orange"
    ]
  },
  "中山國小": {
    x: 48,
    y: 44.8,
    lines: [
      "orange"
    ]
  },
  "行天宮": {
    x: 54.5,
    y: 48,
    lines: [
      "orange"
    ]
  },
  "頂溪": {
    x: 42.5,
    y: 73.5,
    lines: [
      "orange"
    ]
  },
  "蘆洲": {
    x: 19.5,
    y: 31.7,
    lines: [
      "orange",
      "yellow"
    ]
  },
  "三民高中": {
    x: 22,
    y: 34.3,
    lines: [
      "orange",
      "yellow"
    ]
  },
  "徐匯中學": {
    x: 24.5,
    y: 36.9,
    lines: [
      "orange",
      "yellow"
    ]
  },
  "三和國中": {
    x: 27,
    y: 39.5,
    lines: [
      "orange",
      "yellow"
    ]
  },
  "三重國小": {
    x: 26.4,
    y: 42.1,
    lines: [
      "orange",
      "yellow"
    ]
  },
  "南港展覽館": {
    x: 93.5,
    y: 48.5,
    lines: [
      "brown",
      "blue"
    ]
  },
  "內湖": {
    x: 82.3,
    y: 36.1,
    lines: [
      "brown"
    ]
  },
  "劍南路": {
    x: 61.5,
    y: 37,
    lines: [
      "brown"
    ]
  },
  "大直": {
    x: 61.5,
    y: 41,
    lines: [
      "brown"
    ]
  },
  "松山機場": {
    x: 61.5,
    y: 44.5,
    lines: [
      "brown"
    ]
  },
  "中山國中": {
    x: 61.5,
    y: 48,
    lines: [
      "brown"
    ]
  },
  "科技大樓": {
    x: 61.5,
    y: 69.3,
    lines: [
      "brown"
    ]
  },
  "六張犁": {
    x: 67.5,
    y: 72,
    lines: [
      "brown"
    ]
  },
  "動物園": {
    x: 85.5,
    y: 81,
    lines: [
      "brown"
    ]
  },
  "新埔民生": {
    x: 16,
    y: 67,
    lines: [
      "yellow"
    ]
  },
  "景安": {
    x: 42.5,
    y: 81,
    lines: [
      "yellow",
      "orange"
    ]
  },
  "大坪林": {
    x: 64.5,
    y: 84.5,
    lines: [
      "yellow",
      "green"
    ]
  },
  "林口": {
    x: 5.5,
    y: 32.5,
    lines: [
      "purple"
    ]
  },
  "泰山": {
    x: 11.5,
    y: 43.5,
    lines: [
      "purple"
    ]
  },
  "新莊副都心": {
    x: 11.5,
    y: 46.5,
    lines: [
      "purple"
    ]
  },
  "敦化or": {
    x: 50,
    y: 50,
    lines: []
  },
  "國父紀念館站🤏🏾": {
    x: 50,
    y: 50,
    lines: []
  },
  "可嘗試一次": {
    x: 50,
    y: 50,
    lines: []
  },
  "本店（北車）": {
    x: 42.6,
    y: 58.2,
    lines: []
  }
};

const LINE_COLORS = {
  'red': '#e3002c',
  'blue': '#0070bd',
  'green': '#008659',
  'orange': '#f8b61c',
  'brown': '#c48c31',
  'yellow': '#ffdf00',
  'purple': '#8e44ad',
};

const LINE_NAMES = [
  { id: 'all', name: '全線' },
  { id: 'red', name: '🔴 紅線' },
  { id: 'blue', name: '🔵 藍線' },
  { id: 'green', name: '🟢 綠線' },
  { id: 'orange', name: '🟠 橘線' },
  { id: 'brown', name: '🟤 棕線' },
  { id: 'yellow', name: '🟡 黃線' },
  { id: 'purple', name: '🟣 機捷' }
];

export const MapPane = () => {
  const { state } = useStore();
  const [activeLine, setActiveLine] = useState('all');
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);
  const [clickedStation, setClickedStation] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [localCoords, setLocalCoords] = useState(STATION_COORDS);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!editMode || !clickedStation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      setLocalCoords((prev) => {
        const coords = prev[clickedStation];
        if (!coords) return prev;
        
        let dx = 0;
        let dy = 0;
        const step = e.shiftKey ? 0.5 : 0.1; // Shift for larger steps

        switch (e.key) {
          case 'ArrowUp':
          case 'w':
            dy = -step; break;
          case 'ArrowDown':
          case 's':
            dy = step; break;
          case 'ArrowLeft':
          case 'a':
            dx = -step; break;
          case 'ArrowRight':
          case 'd':
            dx = step; break;
          default:
            return prev;
        }

        e.preventDefault();
        return {
          ...prev,
          [clickedStation]: {
            ...coords,
            x: Number((coords.x + dx).toFixed(2)),
            y: Number((coords.y + dy).toFixed(2))
          }
        };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, clickedStation]);

  // Aggregate all stores by station
  const stationStores = useMemo(() => {
    const map = new Map<string, any[]>();

    
    // Add visited
    state.visited.forEach(v => {
      if (!v.station) return;
      const arr = map.get(v.station) || [];
      arr.push({ ...v, type: 'visited' });
      map.set(v.station, arr);
    });
    
    // Add wishes
    state.wish.forEach(w => {
      if (!w.station) return;
      const arr = map.get(w.station) || [];
      arr.push({ ...w, type: 'wish' });
      map.set(w.station, arr);
    });

    return map;
  }, [state.visited, state.wish]);

  // Keep localCoords updated with any missing stations from stores
  useEffect(() => {
    setLocalCoords(prev => {
      let changed = false;
      const next = { ...prev };
      for (const station of stationStores.keys()) {
        if (!next[station]) {
          next[station] = { x: 50, y: 50, lines: [] };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [stationStores]);

  const activeStation = clickedStation || hoveredStation;
  const activeStores = activeStation ? stationStores.get(activeStation) : null;

  return (
    <div className="grid-area full" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', paddingBottom: 0, marginBottom: 0 }}>
      {/* Line Filter */}
      <div className="filter-bar" style={{ padding: '0 24px 12px', flexShrink: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        {LINE_NAMES.map(l => (
          <button 
            key={l.id}
            className={`fbtn ${activeLine === l.id ? 'on' : ''}`}
            onClick={() => setActiveLine(l.id)}
            style={activeLine === l.id && l.id !== 'all' ? { backgroundColor: LINE_COLORS[l.id as keyof typeof LINE_COLORS], borderColor: LINE_COLORS[l.id as keyof typeof LINE_COLORS], color: '#fff' } : {}}
          >
            {l.name}
          </button>
        ))}
        {process.env.NODE_ENV === 'development' && (
          <button 
            className={`fbtn ${editMode ? 'on' : ''}`}
            onClick={() => setEditMode(!editMode)}
            style={{ 
              marginLeft: 'auto',
              ...(editMode ? { backgroundColor: 'var(--blue)', color: '#fff', borderColor: 'var(--blue)' } : {})
            }}
          >
            🔧 編輯座標
          </button>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#eef1f4', border: 'var(--bdr)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, position: 'relative' }}>
        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={8}
          limitToBounds={false}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
        >
          {(utils) => {
            const currentScale = utils.state.scale;
            // The inverse scale allows our pins to stay visually the same size when zooming
            const inverseScale = 1 / currentScale;

            return (
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <div style={{ position: 'relative', width: 1200, maxWidth: 'none' }}>
                    <img 
                      ref={imgRef}
                      src="/metro.png" 
                      alt="Taipei Metro Map" 
                      style={{ width: '100%', height: 'auto', display: 'block', cursor: editMode && clickedStation ? 'crosshair' : 'default' }}
                      onPointerDown={(e) => { 
                        if (editMode && clickedStation && imgRef.current) {
                          // Allow jumping the pin to roughly where we clicked, if a station is selected
                          e.stopPropagation();
                          const rect = imgRef.current.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          setLocalCoords(prev => ({
                            ...prev,
                            [clickedStation]: {
                              ...prev[clickedStation],
                              x: Number(x.toFixed(2)),
                              y: Number(y.toFixed(2))
                            }
                          }));
                        } else {
                          setClickedStation(null); 
                          setHoveredStation(null); 
                        }
                      }}
                    />
                  
                  {/* Overlay Pins */}
                  {Array.from(stationStores.entries()).map(([stationName, stores]) => {
                    const coords = localCoords[stationName] || STATION_COORDS[stationName];
                    if (!coords) return null;

                    if (activeLine !== 'all' && !coords.lines.includes(activeLine)) {
                      return null;
                    }

                    const hasVisited = stores.some(s => s.type === 'visited');
                    const isSelected = activeStation === stationName;

                    return (
                      <div 
                        key={stationName}
                        onMouseEnter={() => setHoveredStation(stationName)}
                        onMouseLeave={() => setHoveredStation(null)}
                        style={{
                          position: 'absolute',
                          left: `${coords.x}%`,
                          top: `${coords.y}%`,
                          // Keep the center at the exact coordinate, but inverse scale it
                          transform: `translate(-50%, -50%) scale(${inverseScale})`,
                          transformOrigin: 'center center',
                          zIndex: isSelected ? 200 : 150,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                    {/* Visual Pin */}
                    <div 
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setClickedStation(stationName === clickedStation ? null : stationName);
                      }}
                      style={{
                        backgroundColor: (editMode && isSelected) ? '#FFD700' : (hasVisited ? 'var(--green)' : 'var(--red)'),
                        color: '#fff',
                        width: isSelected ? 28 : 22,
                        height: isSelected ? 28 : 22,
                        borderRadius: '50%',
                        border: (editMode && isSelected) ? 'none' : '3px solid #fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 2
                      }}
                    >
                       <div style={{ width: 8, height: 8, background: '#fff', borderRadius: '50%' }} />
                    </div>

                    {/* Popup Modal right above the pin */}
                    {isSelected && !editMode && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          marginBottom: '8px',
                          background: '#fff',
                          borderRadius: 20,
                          border: 'var(--bdr)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                          padding: '16px',
                          width: 280,
                          animation: 'fadeup 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          zIndex: 2000,
                          pointerEvents: 'auto',
                          cursor: 'default'
                        }}
                      >
                        {/* Invisible bridge to cover the gap for hover */}
                        <div style={{ position: 'absolute', bottom: -16, left: 0, right: 0, height: 16 }} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 20 }}>🍜</span>
                            <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{stationName}</h4>
                            <span className="sec-cnt" style={{ fontSize: 11, background: 'rgba(0,0,0,0.08)' }}>{stores.length} 間店家</span>
                          </div>
                          <button 
                            onClick={() => { setClickedStation(null); setHoveredStation(null); }}
                            style={{ background: 'var(--gray)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                          >
                            ✕
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                          {stores.map(st => (
                            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f8f9fa', borderRadius: 12, border: '1px solid rgba(0,0,0,0.03)' }}>
                              <span style={{ 
                                fontSize: 10, 
                                fontWeight: 800, 
                                color: '#fff',
                                background: st.type === 'visited' ? 'var(--green)' : 'var(--red)',
                                padding: '3px 8px',
                                borderRadius: 8,
                                minWidth: 44,
                                textAlign: 'center',
                                textTransform: 'uppercase'
                              }}>
                                {st.type === 'visited' ? '已吃' : '想去'}
                              </span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{st.shop}</div>
                                {st.style && <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{st.style}</div>}
                              </div>
                              {(st.type === 'visited' && st.visits?.[0]?.rating) && (
                                <div style={{ fontSize: 13, background: 'var(--yellow-lt)', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--yellow)' }}>
                                  {'⭐'.repeat(st.visits[0].rating)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TransformComponent>
            );
          }}
        </TransformWrapper>
        </div>
      
        {/* Dev JSON output */}
        {editMode && (
          <div style={{ height: 180, background: '#1e1e1e', color: '#d4d4d4', padding: 12, fontFamily: 'monospace', fontSize: 12, overflow: 'auto', zIndex: 1000, position: 'relative' }}>
            <div style={{ marginBottom: 8, color: '#9cdcfe' }}>
              {clickedStation 
                ? `📍 點擊地圖粗略定位「${clickedStation}」，再使用 WASD 或方向鍵微調（按住 Shift 可加速）...` 
                : `👉 編輯模式：請先點擊地圖上的圖釘來選取它（圓圈變紫），然後再點擊圖上的確切位置來移動，支援鍵盤微調！`}
            </div>
            <textarea 
              readOnly
              value={`// 請將這段貼回 AI，或直接複製取代 STATION_COORDS:\nconst STATION_COORDS: Record<string, { x: number; y: number; lines: string[] }> = ${JSON.stringify(localCoords, null, 2).replace(/"x":/g, 'x:').replace(/"y":/g, 'y:').replace(/"lines":/g, 'lines:')};`}
              style={{ width: '100%', height: 130, background: 'transparent', color: 'inherit', border: 'none', resize: 'none' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
