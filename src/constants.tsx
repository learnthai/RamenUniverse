export const MRT = [
  { n: '淡水信義線', c: '#ED1C24', s: '紅', stas: ['淡水', '紅樹林', '竹圍', '關渡', '忠義', '復興崗', '北投', '新北投', '奇岩', '唭哩岸', '石牌', '明德', '芝山', '士林', '劍潭', '圓山', '民權西路', '雙連', '中山', '台大醫院', '台北車站', '善導寺', '忠孝新生', '大安森林公園', '大安', '信義安和', '台北101/世貿', '象山'] },
  { n: '板南線', c: '#0070BD', s: '藍', stas: ['頂埔', '土城', '永寧', '海山', '亞東醫院', '府中', '板橋', '新埔', '江子翠', '龍山寺', '西門', '台北車站', '善導寺', '忠孝新生', '忠孝復興', '忠孝敦化', '國父紀念館', '市政府', '永春', '後山埤', '昆陽', '南港', '南港展覽館'] },
  { n: '中和新蘆線', c: '#F8B41A', s: '橘', stas: ['蘆洲', '三民高中', '徐匯中學', '三和國中', '三重國小', '迴龍', '丹鳳', '輔大', '新莊', '頭前庄', '先嗇宮', '三重', '菜寮', '台北橋', '大橋頭', '民權西路', '中山國小', '行天宮', '松江南京', '忠孝新生', '新生', '東門', '古亭', '頂溪', '永安市場', '景安', '南勢角', '中和', '橋和', '中原'] },
  { n: '文湖線', c: '#C09A5B', s: '棕', stas: ['動物園', '木柵', '萬芳社區', '萬芳醫院', '辛亥', '麟光', '六張犁', '科技大樓', '大安', '忠孝復興', '南京復興', '中山國中', '松山機場', '大直', '劍南路', '西湖', '港墘', '文德', '內湖', '大湖公園', '葫洲', '東湖', '南港軟體園區', '南港展覽館'] },
  { n: '松山新店線', c: '#008B48', s: '綠', stas: ['松山', '台北小巨蛋', '南京三民', '行天宮', '中山國小', '台電大樓', '公館', '萬隆', '景美', '大坪林', '七張', '新店區公所', '新店', '小碧潭'] },
  { n: '環狀線', c: '#FECC09', s: '黃', stas: ['大坪林', '十四張', '秀朗橋', '景平', '景安', '中和', '橋和', '中原', '板新', '板橋', '新埔民生', '頭前庄', '幸福', '新北產業園區'] },
];

export const ICONS = {
  CircleEmpty: () => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M13 2.5C7.2 2.5 2.5 7.2 2.5 13S7.2 23.5 13 23.5 23.5 18.8 23.5 13 18.8 2.5 13 2.5Z" stroke="#2A2218" strokeWidth="1.5" fill="white" strokeDasharray="2.5 1.5"/>
    </svg>
  ),
  CircleFilled: () => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="11.5" fill="#2A7A50" stroke="#2A2218" strokeWidth="1.5"/>
      <path d="M8 13.5L11.5 17L18 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2A2218" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2L12 4.5 5 11.5 2 12l.5-3Z"/><path d="M8 3.5L10.5 6"/>
    </svg>
  ),
  Delete: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2A2218" strokeWidth="1.4" strokeLinecap="round">
      <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 8h6.4L11 4"/>
    </svg>
  ),
  Search: () => (
    <svg className="s-ico" viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="#2A2218" strokeWidth="1.5"/>
      <path d="M10 10L14 14" stroke="#2A2218" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" fill="#EAF3FB" />
      <path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12 M5 5 L7 7 M17 17 L19 19 M19 5 L17 7 M5 19 L7 17" />
    </svg>
  ),
  Menu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8442A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  ),
  RamenLogo: () => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12 L28 8 M2 15 L26 11" stroke="currentColor" />
      <path d="M12 16 Q12 9 15 16 M16 16 Q18 9 20 16 M20 16 Q23 10 25 16" stroke="#F5C842" />
      <path d="M5 16 C5 26 10 29 16 29 C22 29 27 26 27 16 Z" fill="#E8442A" />
      <path d="M5 16 C10 18 22 18 27 16 Z" fill="#FDF0ED" />
    </svg>
  ),
  SearchBig: () => (
    <svg width="64" height="64" viewBox="0 0 84 84" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="36" cy="36" r="20" fill="#EAF3FB" />
      <path d="M52 52 L70 70" strokeWidth="4" />
      <path d="M30 28 Q40 22 44 32" strokeOpacity="0.5" strokeWidth="3" />
    </svg>
  ),
  NarutoBig: () => (
    <svg width="64" height="64" viewBox="0 0 84 84" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M42 12 C 50 14, 52 8, 60 12 C 68 16, 62 20, 68 28 C 74 36, 70 38, 72 46 C 74 54, 68 56, 64 64 C 60 72, 54 68, 46 72 C 38 76, 36 70, 28 72 C 20 74, 22 68, 16 60 C 10 52, 14 48, 12 40 C 10 32, 16 30, 16 22 C 16 14, 22 18, 30 14 C 38 10, 36 10, 42 12 Z" fill="#F0EBFA" />
      <path d="M28 42 C 28 34, 36 30, 42 30 C 48 30, 52 36, 52 42 C 52 48, 46 54, 38 52 C 32 50, 32 42, 38 38 C 42 36, 46 40, 44 44" stroke="#E8442A" strokeWidth="3.5" />
    </svg>
  ),
  CheckBig: () => (
    <svg width="64" height="64" viewBox="0 0 84 84" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="42" cy="42" r="30" fill="#EAF7F0" />
      <path d="M26 42 L36 52 L58 30" stroke="#2A7A50" strokeWidth="4" />
    </svg>
  ),
  MapBig: () => (
    <svg width="64" height="64" viewBox="0 0 84 84" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M42 74 C 42 74, 20 50, 20 34 C 20 18, 30 12, 42 12 C 54 12, 64 18, 64 34 C 64 50, 42 74, 42 74 Z" fill="#EAF3FB" />
      <circle cx="42" cy="32" r="8" fill="#E8442A" />
      <path d="M28 34 Q24 24 32 20" strokeOpacity="0.4" />
    </svg>
  ),
  ExportBig: () => (
    <svg width="64" height="64" viewBox="0 0 84 84" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 32 L26 32 L32 22 L52 22 L58 32 L68 32 C 72 32 76 36 76 42 L76 64 C 76 70 72 74 68 74 L16 74 C 12 74 8 70 8 64 L8 42 C 8 36 12 32 16 32 Z" fill="#FFFBE8" />
      <circle cx="42" cy="52" r="12" fill="#F5C842" />
      <circle cx="62" cy="42" r="3" fill="currentColor" />
    </svg>
  )
};
