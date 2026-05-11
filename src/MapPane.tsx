import React, { useState, useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useStore } from './store';

// Mapping SVG Path IDs to human-readable station names used in the app
const STATION_ID_TO_NAME: Record<string, string> = {
  // 轉乘站
  "O11_R13": "民權西路",
  "G14_R11": "中山",
  "B12_R10": "台北車站",
  "G10_R08": "中正紀念堂",
  "R07_O06": "東門",
  "R05_BR09": "大安",
  "G15_O08": "松江南京",
  "BL14_O07": "忠孝新生",
  "G09_O05": "古亭",
  "BL11_G12": "西門",
  "G16_BR11": "南京復興",
  "BL15_BR10": "忠孝復興",
  "BL23_BR24": "南港展覽館",

  // 橘線 (O)
  "O54": "蘆洲", "O53": "三民高中", "O52": "徐匯中學", "O51": "三和國中", "O50": "三重國小",
  "O21": "迴龍", "O20": "丹鳳", "O19": "輔大", "O18": "新莊", "O17": "頭前庄", "O16": "先嗇宮",
  "O15": "三重", "O14": "菜寮", "O13": "台北橋", "O12": "大橋頭",
  "O10": "中山國小", "O09": "行天宮", "O04": "頂溪", "O03": "永安市場", "O02": "景安", "O01": "南勢角",

  // 紅線 (R)
  "R28": "淡水", "R27": "紅樹林", "R26": "竹圍", "R25": "關渡", "R24": "忠義", "R23": "復興崗",
  "R22": "北投", "R22A": "新北投", "R21": "奇岩", "R20": "唭哩岸", "R19": "石牌", "R18": "明德",
  "R17": "芝山", "R16": "士林", "R15": "劍潭", "R14": "圓山", "R12": "雙連", "R09": "台大醫院",
  "R06": "大安森林公園", "R04": "信義安和", "R03": "台北101/世貿", "R02": "象山",

  // 綠線 (G)
  "G01": "新店", "G02": "新店區公所", "G03": "七張", "G03A": "小碧潭", "G04": "大坪林", "G05": "景美", "G06": "萬隆", "G07": "公館", "G08": "台電大樓", "G11": "小南門", "G13": "北門", "G17": "台北小巨蛋", "G18": "南京三民", "G19": "松山",

  // 藍線 (BL)
  "BL01": "頂埔", "BL02": "永寧", "BL03": "土城", "BL04": "海山", "BL05": "亞東醫院", "BL06": "府中", "BL07": "板橋", "BL08": "新埔", "BL09": "江子翠", "BL10": "龍山寺", "BL13": "善導寺", "BL16": "忠孝敦化", "BL17": "國父紀念館", "BL18": "市政府", "BL19": "永春", "BL20": "後山埤", "BL21": "昆陽", "BL22": "南港",

  // 棕線 (BR)
  "BR01": "動物園", "BR02": "木柵", "BR03": "萬芳社區", "BR04": "萬芳醫院", "BR05": "辛亥", "BR06": "麟光", "BR07": "六張犁", "BR08": "科技大樓", "BR12": "中山國中", "BR13": "松山機場", "BR14": "大直", "BR15": "劍南路", "BR16": "西湖", "BR17": "港墘", "BR18": "文德", "BR19": "內湖", "BR20": "大湖公園", "BR21": "葫洲", "BR22": "東湖", "BR23": "南港軟體園區",
};

// Colors for highlighting active stations
const COLORS = {
  visited: 'rgba(42, 122, 100, 0.4)', // var(--green)
  wish: 'rgba(232, 68, 42, 0.4)',    // var(--red)
  active: 'rgba(74, 142, 194, 0.4)', // var(--blue)
};

export const MapPane = () => {
  const { state } = useStore();
  const [clickedStation, setClickedStation] = useState<string | null>(null);
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  // Aggregate stores by station name
  const stationStores = useMemo(() => {
    const map = new Map<string, any[]>();
    
    state.visited.forEach(v => {
      if (!v.station) return;
      const arr = map.get(v.station) || [];
      arr.push({ ...v, type: 'visited' });
      map.set(v.station, arr);
    });
    
    state.wish.forEach(w => {
      if (!w.station) return;
      const arr = map.get(w.station) || [];
      arr.push({ ...w, type: 'wish' });
      map.set(w.station, arr);
    });

    return map;
  }, [state.visited, state.wish]);

  const activeStation = clickedStation || hoveredStation;
  const activeStores = activeStation ? stationStores.get(activeStation) : null;

  // Helper to get status of a station ID
  const getStationStatus = (id: string) => {
    const name = STATION_ID_TO_NAME[id];
    if (!name) return null;
    const stores = stationStores.get(name);
    if (!stores) return null;
    return stores.some(s => s.type === 'visited') ? 'visited' : 'wish';
  };

  const handlePathClick = (id: string) => {
    const name = STATION_ID_TO_NAME[id];
    if (name) {
      setClickedStation(name === clickedStation ? null : name);
    }
  };

  return (
    <div className="grid-area full" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', paddingBottom: 0, marginBottom: 0 }}>
      {/* List count summary */}
      <div style={{ padding: '0 24px 12px', flexShrink: 0, display: 'flex', gap: 10, alignItems: 'center' }}>
         <div style={{ fontSize: 13, fontWeight: 700, background: '#fff', padding: '6px 12px', borderRadius: 100, border: 'var(--bdr)', boxShadow: 'var(--shadow-sm)' }}>
           已地標：{Array.from(stationStores.keys()).length} 站
         </div>
         <p style={{ fontSize: 11, color: 'var(--ink-soft)' }}>點擊地圖上的站點查看拉麵清單</p>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {/* Map Container - Robust Padding-Top Square */}
        <div className="relative w-full mx-auto" style={{ paddingTop: '100%', borderRadius: 12, border: 'var(--bdr)', overflow: 'hidden' }}>
          <div className="absolute inset-0">
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={8}
              centerOnInit={true}
              limitToBounds={true}
            >
              <TransformComponent 
                wrapperClassName="!w-full !h-full" 
                contentClassName="!w-full !h-full"
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ width: '100%', height: '100%' }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  xmlnsXlink="http://www.w3.org/1999/xlink" 
                  viewBox="0 0 580 580"
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  className="w-full h-full block"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    touchAction: 'none', 
                    display: 'block',
                    objectFit: 'cover'
                  }}
                  onClick={() => {
                      if (!hoveredStation) setClickedStation(null);
                  }}
                >
                  {/* 底圖層 */}
                  <g id="Background_Map">
                    <image 
                      x="0"
                      y="0"
                      width="580" 
                      height="580" 
                      preserveAspectRatio="none"
                      xlinkHref="https://cdn.phototourl.com/free/2026-05-05-8f3ccc54-e909-4054-b570-7358d778c9a5.jpg"
                    />
                  </g>
                    
                    {/* 互動點擊層 */}
                    <g id="Interactions" style={{ cursor: 'pointer' }}>
                      {/* 轉乘站 */}
                      {[
                        { id: 'O11_R13', d: 'M233.13,243.41h-12.24c-1.69,0-3.06,1.35-3.06,3.02v5.58c0,1.66,1.37,3.02,3.06,3.02h12.24c1.69,0,3.06-1.36,3.06-3.02v-5.58c0-1.67-1.37-3.02-3.06-3.02' },
                        { id: 'G14_R11', d: 'M233.13,285.35h-12.24c-1.68,0-3.06,1.36-3.06,3.02v5.58c0,1.67,1.37,3.02,3.06,3.02h12.24c1.69,0,3.06-1.35,3.06-3.02v-5.58c0-1.66-1.37-3.02-3.06-3.02' },
                        { id: 'B12_R10', d: 'M233.14,323.78h-12.24c-1.69,0-3.06,1.35-3.06,3.02v5.58c0,1.67,1.37,3.02,3.06,3.02h12.24c1.69,0,3.06-1.36,3.06-3.02v-5.58c0-1.67-1.37-3.02-3.06-3.02' },
                        { id: 'G10_R08', d: 'M233.13,365.93h-12.24c-1.68,0-3.06,1.36-3.06,3.02v5.58c0,1.67,1.37,3.02,3.06,3.02h12.24c1.69,0,3.06-1.35,3.06-3.02v-5.58c0-1.66-1.37-3.02-3.06-3.02' },
                        { id: 'R07_O06', d: 'M275.83,366.06h-12.24c-1.68,0-3.05,1.36-3.05,3.02v5.58c0,1.66,1.37,3.02,3.05,3.02h12.24c1.68,0,3.05-1.36,3.05-3.02v-5.58c0-1.66-1.37-3.02-3.05-3.02' },
                        { id: 'R05_BR09', d: 'M327.09,366.06h-12.24c-1.68,0-3.06,1.36-3.06,3.02v5.58c0,1.66,1.37,3.02,3.06,3.02h12.24c1.69,0,3.06-1.36,3.06-3.02v-5.58c0-1.67-1.37-3.02-3.06-3.02' },
                        { id: 'G15_O08', d: 'M281.1,285.35h-12.24c-1.68,0-3.05,1.36-3.05,3.02v5.58c0,1.67,1.37,3.02,3.05,3.02h12.24c1.69,0,3.06-1.35,3.06-3.02v-5.58c0-1.66-1.37-3.02-3.06-3.02' },
                        { id: 'BL14_O07', d: 'M281.1,323.77h-12.25c-1.68,0-3.05,1.36-3.05,3.02v5.58c0,1.66,1.37,3.02,3.05,3.02h12.25c1.68,0,3.06-1.36,3.06-3.02v-5.58c0-1.67-1.37-3.02-3.06-3.02' },
                        { id: 'G09_O05', d: 'M254.59,388.21h-12.24c-1.69,0-3.06,1.35-3.06,3.02v5.58c0,1.66,1.37,3.02,3.06,3.02h12.24c1.69,0,3.06-1.36,3.06-3.02v-5.58c0-1.66-1.37-3.02-3.06-3.02' },
                        { id: 'BL11_G12', d: 'M199.6,323.78h-12.25c-1.68,0-3.06,1.35-3.06,3.02v5.58c0,1.66,1.37,3.02,3.06,3.02h12.25c1.68,0,3.06-1.36,3.06-3.02v-5.58c0-1.67-1.37-3.02-3.06-3.02' },
                        { id: 'G16_BR11', d: 'M327.1,285.35h-12.25c-1.69,0-3.05,1.36-3.05,3.02v5.58c0,1.67,1.36,3.02,3.05,3.02h12.25c1.69,0,3.05-1.35,3.05-3.02v-5.58c0-1.66-1.37-3.02-3.05-3.02' },
                        { id: 'BL15_BR10', d: 'M327.1,323.77h-12.25c-1.69,0-3.06,1.36-3.06,3.02v5.58c0,1.66,1.37,3.02,3.06,3.02h12.25c1.68,0,3.05-1.36,3.05-3.02v-5.58c0-1.67-1.37-3.02-3.05-3.02' },
                        { id: 'BL23_BR24', d: 'M516.93,298h-11.65c-1.68,0-3.05,1.35-3.05,3.02v5.58c0,1.67,1.37,3.02,3.05,3.02h11.65c1.68,0,3.05-1.36,3.05-3.02v-5.58c0-1.67-1.37-3.02-3.05-3.02' },
                      ].map(path => (
                        <path 
                          key={path.id}
                          id={path.id} 
                          d={path.d} 
                          fill={clickedStation === STATION_ID_TO_NAME[path.id] ? COLORS.active : (getStationStatus(path.id) === 'visited' ? COLORS.visited : (getStationStatus(path.id) === 'wish' ? COLORS.wish : 'transparent'))}
                          stroke={clickedStation === STATION_ID_TO_NAME[path.id] ? 'var(--blue)' : 'transparent'}
                          strokeWidth="1.2"
                          onMouseEnter={() => setHoveredStation(STATION_ID_TO_NAME[path.id])}
                          onMouseLeave={() => setHoveredStation(null)}
                          onClick={(e) => { e.stopPropagation(); handlePathClick(path.id); }}
                        />
                      ))}

                      {/* 橘線站點 */}
                      {[
                        { id: 'O54', d: 'M90.49,161.35h-3.51c-1.24,0-2.26,1-2.26,2.23v5.66c0,1.23,1.02,2.23,2.26,2.23h3.51c1.25,0,2.26-1,2.26-2.23v-5.66c0-1.23-1.01-2.23-2.26-2.23' },
                        { id: 'O53', d: 'M101.18,184.61c0,1.1.9,1.98,2.01,1.98h3.51c1.11,0,2.01-.88,2.01-1.98v-5.66c0-1.09-.9-1.98-2.01-1.98h-3.51c-1.11,0-2.01.89-2.01,1.98v5.66Z' },
                        { id: 'O52', d: 'M118.38,201.32c0,1.09.9,1.98,2.01,1.98h3.51c1.11,0,2.01-.89,2.01-1.98v-5.66c0-1.09-.9-1.98-2.01-1.98h-3.51c-1.11,0-2.01.89-2.01,1.98v5.66Z' },
                        { id: 'O51', d: 'M134.43,216.9c0,1.1.9,1.98,2.01,1.98h3.51c1.11,0,2.01-.89,2.01-1.98v-5.66c0-1.09-.9-1.98-2.01-1.98h-3.51c-1.11,0-2.01.89-2.01,1.98v5.66Z' },
                        { id: 'O50', d: 'M150.91,233.01c0,1.09.9,1.98,2.01,1.98h3.51c1.11,0,2.01-.89,2.01-1.98v-5.66c0-1.09-.9-1.98-2.01-1.98h-3.51c-1.11,0-2.01.89-2.01,1.98v5.66Z' },
                        { id: 'O21', d: 'M33.05,385.14h-3.51c-1.24,0-2.26,1-2.26,2.23v5.66c0,1.23,1.01,2.23,2.26,2.23h3.51c1.25,0,2.26-1,2.26-2.23v-5.66c0-1.23-1.01-2.23-2.26-2.23' },
                        { id: 'O20', d: 'M43.74,376.65c0,1.1.9,1.98,2,1.98h3.51c1.11,0,2.01-.88,2.01-1.98v-5.66c0-1.09-.9-1.98-2.01-1.98h-3.51c-1.11,0-2,.89-2,1.98v5.66Z' },
                        { id: 'O19', d: 'M59.08,361.18c0,1.09.9,1.98,2,1.98h3.51c1.11,0,2.01-.89,2.01-1.98v-5.66c0-1.09-.9-1.98-2.01-1.98h-3.51c-1.11,0-2,.89-2,1.98,0,0,0,5.66,0,5.66Z' },
                        { id: 'O18', d: 'M75.44,346.07c0,1.1.9,1.98,2.01,1.98h3.51c1.11,0,2.01-.89,2.01-1.98v-5.66c0-1.09-.9-1.98-2.01-1.98h-3.51c-1.11,0-2.01.89-2.01,1.98v5.66Z' },
                        { id: 'O17', d: 'M92.29,329.76c0,1.1.9,1.98,2.01,1.98h3.51c1.11,0,2.01-.88,2.01-1.98v-5.65c0-1.1-.9-1.98-2.01-1.98h-3.51c-1.11,0-2.01.89-2.01,1.98v5.65Z' },
                      ].map(path => (
                        <path 
                          key={path.id}
                          id={path.id} 
                          d={path.d} 
                          fill={clickedStation === STATION_ID_TO_NAME[path.id] ? COLORS.active : (getStationStatus(path.id) === 'visited' ? COLORS.visited : (getStationStatus(path.id) === 'wish' ? COLORS.wish : 'transparent'))}
                          stroke={clickedStation === STATION_ID_TO_NAME[path.id] ? 'var(--blue)' : 'transparent'}
                          strokeWidth="1.2"
                          onMouseEnter={() => setHoveredStation(STATION_ID_TO_NAME[path.id])}
                          onMouseLeave={() => setHoveredStation(null)}
                          onClick={(e) => { e.stopPropagation(); handlePathClick(path.id); }}
                        />
                      ))}
{/* 紅線站點 */}
                      {[
                        { id: 'R28', d: 'M83.2,31.45h-3.51c-1.25,0-2.26,1-2.26,2.23v5.66c0,1.23,1.01,2.23,2.26,2.23h3.51c1.25,0,2.26-1,2.26-2.23v-5.66c0-1.23-1.01-2.23-2.26-2.23' },
                        { id: 'R27', d: 'M77.68,61.88c0,1.1.9,1.98,2.01,1.98h3.51c1.11,0,2.01-.89,2.01-1.98v-5.66c0-1.1-.9-1.98-2.01-1.98h-3.51c-1.11,0-2.01.89-2.01,1.98v5.66Z' },
                        { id: 'R22', d: 'M155,108.03c0,1.09.9,1.98,2.01,1.98h3.51c1.11,0,2.01-.89,2.01-1.98v-5.66c0-1.09-.9-1.98-2.01-1.98h-3.51c-1.11,0-2.01.89-2.01,1.98v5.66Z' },
                        { id: 'R22A', d: 'M160.32,80.29h-3.51c-1.25,0-2.26,1-2.26,2.23v5.66c0,1.23,1.01,2.23,2.26,2.23h3.51c1.25,0,2.26-1,2.26-2.23v-5.66c0-1.23-1.01-2.23-2.26-2.23' },
                        { id: 'R15', d: 'M223.33,201.45c0,1.1.9,1.98,2.01,1.98h3.51c1.11,0,2.01-.89,2.01-1.98v-5.66c0-1.1-.9-1.98-2.01-1.98h-3.51c-1.11,0-2.01.89-2.01,1.98v5.66Z' },
                        { id: 'R09', d: 'M223.25,353.57c0,1.1.9,1.98,2.01,1.98h3.51c1.11,0,2.01-.89,2.01-1.98v-5.66c0-1.09-.9-1.98-2.01-1.98h-3.51c-1.11,0-2.01.89-2.01,1.98v5.66Z' },
                        { id: 'R02', d: 'M400.13,366.68h-3.51c-1.25,0-2.26,1-2.26,2.23v5.66c0,1.23,1.01,2.23,2.26,2.23h3.51c1.25,0,2.26-1,2.26-2.23v-5.66c0-1.23-1.01-2.23-2.26-2.23' },
                      ].map(path => (
                        <path key={path.id} id={path.id} d={path.d} 
                          fill={clickedStation === STATION_ID_TO_NAME[path.id] ? COLORS.active : (getStationStatus(path.id) === 'visited' ? COLORS.visited : (getStationStatus(path.id) === 'wish' ? COLORS.wish : 'transparent'))}
                          stroke={clickedStation === STATION_ID_TO_NAME[path.id] ? 'var(--blue)' : 'transparent'}
                          strokeWidth="1.2"
                          onMouseEnter={() => setHoveredStation(STATION_ID_TO_NAME[path.id])}
                          onMouseLeave={() => setHoveredStation(null)}
                          onClick={(e) => { e.stopPropagation(); handlePathClick(path.id); }}
                        />
                      ))}

                      {/* 綠線站點 */}
                      {[
                        { id: 'G01', d: 'M304.45,540.43h-3.52c-1.24,0-2.26,1-2.26,2.23v5.66c0,1.23,1.01,2.23,2.26,2.23h3.52c1.24,0,2.26-1,2.26-2.23v-5.66c0-1.23-1.01-2.23-2.26-2.23' },
                        { id: 'G19', d: 'M422.58,286.1h-3.51c-1.25,0-2.26,1-2.26,2.23v5.66c0,1.23,1.01,2.23,2.26,2.23h3.51c1.24,0,2.26-1,2.26-2.23v-5.66c0-1.23-1.01-2.23-2.26-2.23' },
                      ].map(path => (
                        <path key={path.id} id={path.id} d={path.d} 
                          fill={clickedStation === STATION_ID_TO_NAME[path.id] ? COLORS.active : (getStationStatus(path.id) === 'visited' ? COLORS.visited : (getStationStatus(path.id) === 'wish' ? COLORS.wish : 'transparent'))}
                          stroke={clickedStation === STATION_ID_TO_NAME[path.id] ? 'var(--blue)' : 'transparent'}
                          strokeWidth="1.2"
                          onMouseEnter={() => setHoveredStation(STATION_ID_TO_NAME[path.id])}
                          onMouseLeave={() => setHoveredStation(null)}
                          onClick={(e) => { e.stopPropagation(); handlePathClick(path.id); }}
                        />
                      ))}

                      {/* 藍線站點 */}
                      {[
                        { id: 'BL01', d: 'M88.26,521.61h-3.34c-1.18,0-2.15-.95-2.15-2.12v-5.38c0-1.17.97-2.12,2.15-2.12h3.34c1.18,0,2.15.95,2.15,2.12v5.38c0,1.17-.96,2.12-2.15,2.12' },
                        { id: 'BL22', d: 'M479.04,306.57c0,1.1.9,1.98,2,1.98h3.51c1.11,0,2.01-.89,2.01-1.98v-5.65c0-1.09-.9-1.98-2.01-1.98h-3.51c-1.11,0-2,.89-2,1.98v5.65Z' },
                      ].map(path => (
                        <path key={path.id} id={path.id} d={path.d} 
                          fill={clickedStation === STATION_ID_TO_NAME[path.id] ? COLORS.active : (getStationStatus(path.id) === 'visited' ? COLORS.visited : (getStationStatus(path.id) === 'wish' ? COLORS.wish : 'transparent'))}
                          stroke={clickedStation === STATION_ID_TO_NAME[path.id] ? 'var(--blue)' : 'transparent'}
                          strokeWidth="1.2"
                          onMouseEnter={() => setHoveredStation(STATION_ID_TO_NAME[path.id])}
                          onMouseLeave={() => setHoveredStation(null)}
                          onClick={(e) => { e.stopPropagation(); handlePathClick(path.id); }}
                        />
                      ))}

                      {/* 棕線站點 */}
                      {[
                        { id: 'BR01', d: 'M436.64,460.77h-3.51c-1.24,0-2.26,1-2.26,2.23v5.66c0,1.23,1.01,2.23,2.26,2.23h3.51c1.25,0,2.26-1,2.26-2.23v-5.66c0-1.23-1.01-2.23-2.26-2.23' },
                        { id: 'BR23', d: 'M507.49,280.81c0,1.1.9,1.98,2.01,1.98h3.51c1.11,0,2.01-.89,2.01-1.98v-5.66c0-1.1-.9-1.98-2.01-1.98h-3.51c-1.11,0-2.01.89-2.01,1.98v-5.66Z' },
                      ].map(path => (
                        <path key={path.id} id={path.id} d={path.d} 
                          fill={clickedStation === STATION_ID_TO_NAME[path.id] ? COLORS.active : (getStationStatus(path.id) === 'visited' ? COLORS.visited : (getStationStatus(path.id) === 'wish' ? COLORS.wish : 'transparent'))}
                          stroke={clickedStation === STATION_ID_TO_NAME[path.id] ? 'var(--blue)' : 'transparent'}
                          strokeWidth="1.2"
                          onMouseEnter={() => setHoveredStation(STATION_ID_TO_NAME[path.id])}
                          onMouseLeave={() => setHoveredStation(null)}
                          onClick={(e) => { e.stopPropagation(); handlePathClick(path.id); }}
                        />
                      ))}
                    </g>
                </svg>
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      </div>
          
      {/* Active Station Card Overlay */}
      {clickedStation && (
        <div style={{
            position: 'absolute', top: 20, right: 20, background: '#fff', borderRadius: 20, border: 'var(--bdr)', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: '16px', width: 280, zIndex: 100, 
            animation: 'fadeup 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🍜</span>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{clickedStation}</h4>
              <span className="sec-cnt" style={{ fontSize: 11 }}>{(stationStores.get(clickedStation) || []).length} 間店家</span>
            </div>
            <button onClick={() => setClickedStation(null)}
              style={{ background: 'var(--gray)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
            {(stationStores.get(clickedStation) || []).map(st => (
              <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f8f9fa', borderRadius: 12, border: '1px solid rgba(0,0,0,0.03)' }}>
                <span style={{ 
                  fontSize: 10, fontWeight: 800, color: '#fff',
                  background: st.type === 'visited' ? 'var(--green)' : 'var(--red)',
                  padding: '3px 8px', borderRadius: 8, minWidth: 44, textAlign: 'center'
                }}>
                  {st.type === 'visited' ? '已吃' : '想去'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{st.shop}</div>
                  {st.style && <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{st.style}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
