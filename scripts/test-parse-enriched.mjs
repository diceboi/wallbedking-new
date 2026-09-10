import fs from 'fs';

function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentVal = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(currentVal);
      if (row.length > 1 || row[0] !== '') lines.push(row);
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || row.length > 0) {
    row.push(currentVal);
    lines.push(row);
  }
  return lines;
}

const raw = fs.readFileSync('products_rows_enriched.csv', 'utf8');
const rows = parseCSV(raw);
const headers = rows[0].map(h => h.trim());
const dataRows = rows.slice(1);

const parsedProducts = [];

for (const r of dataRows) {
  const obj = {};
  headers.forEach((h, idx) => {
    let val = r[idx] !== undefined ? r[idx].trim() : '';
    if (val === '') {
      obj[h] = null;
    } else if (['id', 'width', 'length', 'height', 'frame_width', 'folded_up_height', 'folded_up_projection', 'folded_down_projection', 'frame_distance_from_ground', 'mounting_frame_height', 'maximum_mattress_depth', 'stock'].includes(h)) {
      obj[h] = parseInt(val, 10);
    } else if (['weight', 'price_gbp', 'price_euro', 'price_usd', 'sale_percent', 'sale_fix_gbp', 'sale_fix_euro', 'sale_fix_usd', 'sale_price_gbp', 'sale_price_euro', 'sale_price_usd'].includes(h)) {
      obj[h] = parseFloat(val);
    } else if (['backorder', 'has_3d'].includes(h)) {
      obj[h] = val.toLowerCase() === 'true';
    } else if (h === 'product_images') {
      try {
        obj[h] = JSON.parse(val);
      } catch {
        obj[h] = [val];
      }
    } else {
      obj[h] = val;
    }
  });
  parsedProducts.push(obj);
}

console.log('Successfully parsed products count:', parsedProducts.length);
console.log('Sample product 0:');
console.log({
  id: parsedProducts[0].id,
  sku: parsedProducts[0].sku,
  ean: parsedProducts[0].ean,
  name: parsedProducts[0].name,
  weight: parsedProducts[0].weight,
  pack_1: parsedProducts[0].pack_1,
  ean_uk: parsedProducts[0].ean_uk,
});

console.log('Sample product 10 (super king):');
console.log({
  id: parsedProducts[10].id,
  sku: parsedProducts[10].sku,
  ean: parsedProducts[10].ean,
  name: parsedProducts[10].name,
  weight: parsedProducts[10].weight,
  pack_1: parsedProducts[10].pack_1,
  ean_uk: parsedProducts[10].ean_uk,
});
