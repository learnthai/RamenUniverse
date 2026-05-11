const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'new_visits.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const STYLES = ['橫濱家系', '二郎', '泡系', '沾麵', '魚介', '淡麗', '海鮮', '煮干'];
const FLAVORS = ['豚骨', '鹽味', '味增', '醬油', '雞白湯', '牛骨白湯', '雞清湯', '鴨白湯'];

function normalize(str) {
  if (!str) return '';
  if (str.includes('家系')) return '橫濱家系';
  if (str.includes('二郎')) return '二郎';
  if (str.includes('泡系')) return '泡系';
  if (str.includes('沾麵')) return '沾麵';
  if (str.includes('魚介')) return '魚介';
  if (str.includes('淡麗')) return '淡麗';
  if (str.includes('海鮮')) return '海鮮';
  if (str.includes('煮干')) return '煮干';
  if (str.includes('味增') || str.includes('味噌')) return '味增';
  if (str.includes('醬油')) return '醬油';
  if (str.includes('雞白')) return '雞白湯';
  if (str.includes('豚骨')) return '豚骨';
  if (str.includes('鹽味')) return '鹽味';
  if (str.includes('牛骨')) return '牛骨白湯';
  if (str.includes('雞清湯')) return '雞清湯';
  if (str.includes('鴨白')) return '鴨白湯';
  return str;
}

function reclassify(item) {
  let styleCandidate = normalize(item.style);
  let seasonCandidate = normalize(item.season || '');
  
  // Also check item name for clues if fields are empty
  if (!styleCandidate && !seasonCandidate && item.item) {
    const combined = normalize(item.item);
    if (STYLES.includes(combined)) styleCandidate = combined;
    if (FLAVORS.includes(combined)) seasonCandidate = combined;
  }

  let finalStyle = '';
  let finalSeason = '';

  // Check where the candidates belong
  [styleCandidate, seasonCandidate].forEach(c => {
    if (STYLES.includes(c)) finalStyle = c;
    if (FLAVORS.includes(c)) finalSeason = c;
  });

  // Special logic for combined strings like "魚介豚骨"
  const allText = (item.style + ' ' + (item.season || '') + ' ' + (item.item || '')).replace(/系/g, '');
  STYLES.forEach(s => {
    if (allText.includes(s)) finalStyle = s;
  });
  FLAVORS.forEach(f => {
    if (allText.includes(f)) finalSeason = f;
    if (f === '味增' && allText.includes('味噌')) finalSeason = '味增';
    if (f === '雞白湯' && allText.includes('雞白')) finalSeason = '雞白湯';
  });

  return { style: finalStyle, season: finalSeason };
}

const fixedData = data.map(shop => {
  const shopClues = {
    style: shop.style,
    season: shop.season || (shop.visits && shop.visits.length > 0 ? shop.visits[0].season : ''),
    item: shop.shop
  };
  
  const { style, season } = reclassify(shopClues);
  
  const updatedShop = {
    ...shop,
    style,
    season,
    visits: (shop.visits || []).map(v => {
      const vClues = {
        style: v.style,
        season: v.season,
        item: v.item
      };
      const vClass = reclassify(vClues);
      return {
        ...v,
        style: vClass.style || style, // Fallback to shop level if visit doesn't specify
        season: vClass.season || season
      };
    })
  };
  return updatedShop;
});

fs.writeFileSync(filePath, JSON.stringify(fixedData, null, 2));
console.log('Processed ' + fixedData.length + ' shops.');
