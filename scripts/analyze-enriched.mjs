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
const headers = rows[0];
const data = rows.slice(1);

console.log('Total data rows in products_rows_enriched.csv:', data.length);
console.log('Headers:', headers);

const fieldCounts = {};
headers.forEach(h => fieldCounts[h] = 0);

data.forEach(r => {
  headers.forEach((h, i) => {
    if (r[i] !== undefined && r[i] !== '') {
      fieldCounts[h]++;
    }
  });
});

console.log('Non-empty counts per header:');
console.log(fieldCounts);
