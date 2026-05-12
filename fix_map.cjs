const fs = require('fs');

const svg = fs.readFileSync('public/TRTS_Route_Map_after_2017s.svg', 'utf8');
const regex = /<path id="([A-Z0-9_]+)"[^>]*d="([^"]+)"/g;

let match;
let stations = [];
while ((match = regex.exec(svg)) !== null) {
  stations.push({ id: match[1], d: match[2] });
}

let mapPane = fs.readFileSync('src/MapPane.tsx', 'utf8');

// Find the <g id="Nodes" ...> block
const gStart = mapPane.indexOf('<g id="Nodes"');
if (gStart === -1) {
  console.log("Could not find <g id=\"Nodes\"");
  process.exit(1);
}
const gEnd = mapPane.indexOf('</g>', gStart);
if (gEnd === -1) {
  console.log("Could not find </g>");
  process.exit(1);
}

// Generate the new content for the <g> block
let newContent = Object.entries(stations).map(
  ([idx, {id, d}]) => `                    {renderStation('${id}', '${d}')}`
).join('\n');

const newMapPane = mapPane.substring(0, gStart) + 
  `<g id="Nodes" style={{ cursor: 'pointer' }}>\n${newContent}\n                  ` + 
  mapPane.substring(gEnd);

fs.writeFileSync('src/MapPane.tsx', newMapPane);
console.log("Updated MapPane.tsx with " + stations.length + " stations.");
