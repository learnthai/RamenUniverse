import fs from 'fs';
const mapFile = fs.readFileSync('src/MapPane.tsx', 'utf-8');
const coordsMatch = mapFile.match(/const STATION_COORDS: Record<string, \{ x: number; y: number; lines: string\[] \}> = \{([\s\S]*?)\};/);
const keys = [];
const regex = /'([^']+)':/g;
let m;
while ((m = regex.exec(coordsMatch[1])) !== null) {
    keys.push(m[1]);
}

const DUMMY_RAW = fs.readFileSync('src/store.ts', 'utf-8');
const rawMatch = DUMMY_RAW.match(/const DUMMY_RAW = `([\s\S]+?)`;/);
const rawStr = rawMatch[1];

const wishes = [];
const visits = [];
let lines = rawStr.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim();
  if (!line) continue;
  if (line.startsWith('鹽：')) continue;
  
  let isVis = line.startsWith('✓');
  let isWish = line.startsWith('◦');
  if (!isVis && !isWish) continue;
  
  line = line.replace(/^[✓◦]\s*/, '').replace(/⚡/g, '').replace(/️/g, '').trim();
  line = line.replace(/👍🏾/g, '').trim();
  
  let shop = '';
  let style = '';
  let station = '';
  
  if (line.includes('（雞白湯）')) {
    shop = '數寄屋'; style = '雞白湯';
    let stMatch = line.match(/→\s*(.*)$/);
    if (stMatch) station = stMatch[1].trim();
  } else if (line.includes('/')) {
    let parts = line.split('/');
    style = parts[0].replace('湯底', '').replace('系', '').trim();
    let right = parts.slice(1).join('/');
    let stMatch = right.match(/→\s*(.*?)$/);
    if (stMatch) {
      station = stMatch[1].trim();
      right = right.replace(/→.*$/, '').trim();
    }
    shop = right.trim();
  } else {
    continue;
  }
  
  if (station.includes(' ')) {
    let sp = station.split(' ');
    station = sp[0].trim();
  }
  
  station = station.replace(/站$/, '').trim();
  if (!shop || !style) continue;
  
  if (isWish) {
    wishes.push({ station: station || undefined });
  } else {
    visits.push({ station: station || undefined });
  }
}

const state = {wish: wishes, visited: visits};

const stationStores = new Map();
[...state.visited, ...state.wish].forEach(r => {
  if (r.station) {
    if (!stationStores.has(r.station)) stationStores.set(r.station, []);
    stationStores.get(r.station).push(r);
  }
});

let i = 1;
for (const k of stationStores.keys()) {
  if (keys.includes(k)) {
    console.log(`nth-of-type(${i}): ${k} (x: ${coordsMatch[1].match(new RegExp(`'${k}':.*?x:\\s*([\\d.]+)`))?.[1]}, y: ${coordsMatch[1].match(new RegExp(`'${k}':.*?y:\\s*([\\d.]+)`))?.[1]})`);
    i++;
  }
}
console.log('Total:', i - 1);
