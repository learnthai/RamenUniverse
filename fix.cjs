const fs = require('fs');
let content = fs.readFileSync('src/MapPane.tsx', 'utf-8');
const stations = ['蘆洲', '三民高中', '徐匯中學', '三和國中', '三重國小'];
stations.forEach(sta => {
  content = content.replace(new RegExp('"' + sta + '": \\{\\s*x: [\\d\\.]+,\\s*y: [\\d\\.]+,\\s*lines: \\[\\s*"orange"\\s*\\]\\s*\\}', 'g'), match => {
    return match.replace('"orange"', '"orange",\n      "yellow"');
  });
});
fs.writeFileSync('src/MapPane.tsx', content);
