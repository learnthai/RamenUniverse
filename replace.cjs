const fs = require('fs');

const coords = {
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
    x: 41.1,
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
    x: 24,
    y: 67.5,
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
    "lines": [
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
      "orange"
    ]
  },
  "三民高中": {
    x: 22,
    y: 34.3,
    lines: [
      "orange"
    ]
  },
  "徐匯中學": {
    x: 24.5,
    y: 36.9,
    lines: [
      "orange"
    ]
  },
  "三和國中": {
    x: 27,
    y: 39.5,
    lines: [
      "orange"
    ]
  },
  "三重國小": {
    x: 26.4,
    y: 42.1,
    lines: [
      "orange"
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
  }
};

let objStr = JSON.stringify(coords, null, 2);
objStr = objStr.replace(/"([\w\d\/]+)":/g, '"$1":').replace(/"x":/g, 'x:').replace(/"y":/g, 'y:').replace(/"lines":/g, 'lines:');

let code = fs.readFileSync('src/MapPane.tsx', 'utf8');
code = code.replace(/const STATION_COORDS:\s*Record<string,\s*\{.*?x:\s*number.*?y:\s*number.*?lines:\s*string\[\].*?\}>\s*=\s*\{[\s\S]*?\};/, 'const STATION_COORDS: Record<string, { x: number; y: number; lines: string[] }> = ' + objStr + ';');
fs.writeFileSync('src/MapPane.tsx', code);
