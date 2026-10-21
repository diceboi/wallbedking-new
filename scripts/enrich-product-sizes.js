const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'src', 'data', 'products-catalog.json');
const sqlPath = path.join(__dirname, '..', 'supabase', 'add_product_sizes.sql');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Standard Bed Sizes with US width & length in inches
const STANDARD_BED_SIZES = [
  { cmWidth: 76, cmLength: 190, cmKey: "76x190", width_us: 30, length_us: 75, usInches: '30" x 75"', usLabel: '30" x 75"' },
  { cmWidth: 80, cmLength: 190, cmKey: "80x190", width_us: 31, length_us: 75, usInches: '31" x 75"', usLabel: '31" x 75"' },
  { cmWidth: 80, cmLength: 200, cmKey: "80x200", width_us: 31, length_us: 80, usInches: '31" x 80"', usLabel: '31" x 80"' },
  { cmWidth: 90, cmLength: 190, cmKey: "90x190", width_us: 36, length_us: 75, usInches: '36" x 75"', usLabel: '36" x 75"' },
  { cmWidth: 90, cmLength: 200, cmKey: "90x200", width_us: 36, length_us: 80, usInches: '36" x 80"', usLabel: '36" x 80"' },
  { cmWidth: 96, cmLength: 190, cmKey: "96x190", width_us: 38, length_us: 75, usInches: '38" x 75"', usLabel: 'Twin (38" x 75")' },
  { cmWidth: 96, cmLength: 200, cmKey: "96x200", width_us: 38, length_us: 80, usInches: '38" x 80"', usLabel: 'Twin XL (38" x 80")' },
  { cmWidth: 100, cmLength: 190, cmKey: "100x190", width_us: 39, length_us: 75, usInches: '39" x 75"', usLabel: '39" x 75"' },
  { cmWidth: 100, cmLength: 200, cmKey: "100x200", width_us: 39, length_us: 80, usInches: '39" x 80"', usLabel: '39" x 80"' },
  { cmWidth: 120, cmLength: 190, cmKey: "120x190", width_us: 48, length_us: 75, usInches: '48" x 75"', usLabel: 'Three Quarter (48" x 75")' },
  { cmWidth: 120, cmLength: 200, cmKey: "120x200", width_us: 48, length_us: 80, usInches: '48" x 80"', usLabel: '48" x 80"' },
  { cmWidth: 135, cmLength: 190, cmKey: "135x190", width_us: 54, length_us: 75, usInches: '54" x 75"', usLabel: 'Full (54" x 75")' },
  { cmWidth: 140, cmLength: 190, cmKey: "140x190", width_us: 55, length_us: 75, usInches: '55" x 75"', usLabel: '55" x 75"' },
  { cmWidth: 140, cmLength: 200, cmKey: "140x200", width_us: 55, length_us: 80, usInches: '55" x 80"', usLabel: '55" x 80"' },
  { cmWidth: 150, cmLength: 200, cmKey: "150x200", width_us: 60, length_us: 80, usInches: '60" x 80"', usLabel: 'Queen (60" x 80")' },
  { cmWidth: 160, cmLength: 200, cmKey: "160x200", width_us: 63, length_us: 80, usInches: '63" x 80"', usLabel: '63" x 80"' },
  { cmWidth: 180, cmLength: 200, cmKey: "180x200", width_us: 71, length_us: 80, usInches: '71" x 80"', usLabel: '71" x 80"' },
  { cmWidth: 192, cmLength: 200, cmKey: "192x200", width_us: 76, length_us: 80, usInches: '76" x 80"', usLabel: 'King (76" x 80")' },
  { cmWidth: 200, cmLength: 200, cmKey: "200x200", width_us: 79, length_us: 79, usInches: '79" x 79"', usLabel: '79" x 79"' },
];

function findSizeByDimensions(width, length) {
  if (!width || !length) return null;
  const numW = Number(width) > 500 ? Math.round(Number(width) / 10) : Math.round(Number(width));
  const numL = Number(length) > 500 ? Math.round(Number(length) / 10) : Math.round(Number(length));
  const minDim = Math.min(numW, numL);
  const maxDim = Math.max(numW, numL);

  const exact = STANDARD_BED_SIZES.find(s => s.cmWidth === minDim && s.cmLength === maxDim);
  if (exact) return exact;

  return STANDARD_BED_SIZES.find(s => Math.abs(s.cmWidth - minDim) <= 2 && Math.abs(s.cmLength - maxDim) <= 2) || null;
}

let updatedCount = 0;
const sqlUpdates = [];

for (const p of catalog) {
  const factory = findSizeByDimensions(p.width, p.length);
  const isBed = p.parent_category === 'beds' || p.parent_category === 'morphy-beds' || p.parent_category === 'traditional-beds';
  const isMattress = p.parent_category === 'mattresses';
  const isCabinet = p.parent_category === 'cabinets';

  // Drop redundant size_eu (EU dimensions already exist in width and length in mm)
  delete p.size_eu;

  // 1. Resolve width_us, length_us & size_us
  if (factory) {
    p.width_us = factory.width_us;
    p.length_us = factory.length_us;
    p.size_us = factory.usLabel;
  } else if (p.width && p.length) {
    const w = Math.round(Number(p.width) / 10);
    const l = Math.round(Number(p.length) / 10);
    p.width_us = Math.round(w / 2.54);
    p.length_us = Math.round(l / 2.54);
    p.size_us = `${p.width_us}" x ${p.length_us}"`;
  }

  // 2. Fix 200x200 MORPHY bed name_us
  const isMorphy = (p.name || '').includes('MORPHY') || (p.category || '').includes('MORPHY');
  if (isBed && isMorphy && factory && factory.cmKey === '200x200') {
    const style = p.type || p.sub_category || 'Classic';
    const orient = p.orientation || 'Vertical';
    p.name_us = `MORPHY™ ${style} 79" x 79" Wall Bed - ${orient}`;
  }

  // 3. Mattress names for US
  if (isMattress) {
    const name = p.name || '';
    let matType = 'Comfort';
    if (/supreme/i.test(name)) matType = 'Supreme';
    else if (/luxury/i.test(name)) matType = 'Luxury';

    if (/single/i.test(name) && !/double/i.test(name)) {
      p.name_us = `Single ${matType} Mattress 36" x 75"`;
      p.width_us = 36;
      p.length_us = 75;
      p.size_us = '36" x 75"';
    } else if (/small\s*double/i.test(name)) {
      p.name_us = `Three Quarter ${matType} Mattress 48" x 75"`;
      p.width_us = 48;
      p.length_us = 75;
      p.size_us = 'Three Quarter (48" x 75")';
    } else if (/double/i.test(name)) {
      p.name_us = `Full ${matType} Mattress 54" x 75"`;
      p.width_us = 54;
      p.length_us = 75;
      p.size_us = 'Full (54" x 75")';
    } else if (/king/i.test(name)) {
      p.name_us = `Queen ${matType} Mattress 60" x 80"`;
      p.width_us = 60;
      p.length_us = 80;
      p.size_us = 'Queen (60" x 80")';
    }
  }

  // 4. Cabinet names for US
  if (isCabinet) {
    const name = p.name || '';
    if (name.includes('Side Unit')) {
      p.name_us = name;
      p.width_us = 20;
      p.length_us = 20.5;
      p.size_us = '20" x 20.5"';
    } else {
      let usPrefix = '';
      let finish = name.split(' - ')[1] || 'Pine';
      let isExtension = name.includes('Extension');
      let orient = name.includes('Horizontal') ? 'Horizontal' : 'Vertical';

      if (name.startsWith('Single')) {
        usPrefix = 'Single 36" x 75"';
        p.width_us = 36;
        p.length_us = 75;
        p.size_us = '36" x 75"';
      } else if (name.startsWith('Small Double')) {
        usPrefix = 'Three Quarter 48" x 75"';
        p.width_us = 48;
        p.length_us = 75;
        p.size_us = 'Three Quarter (48" x 75")';
      } else if (name.startsWith('Double')) {
        usPrefix = 'Full 54" x 75"';
        p.width_us = 54;
        p.length_us = 75;
        p.size_us = 'Full (54" x 75")';
      } else if (name.startsWith('King')) {
        usPrefix = 'Queen 60" x 80"';
        p.width_us = 60;
        p.length_us = 80;
        p.size_us = 'Queen (60" x 80")';
      }

      if (usPrefix) {
        if (isExtension) {
          p.name_us = `${usPrefix} ${orient} Cabinet Extension - ${finish}`;
        } else {
          p.name_us = `${usPrefix} ${orient} Cabinet - ${finish}`;
        }
      }
    }
  }

  // Build SQL update statement
  if (p.id) {
    const parts = [];
    if (p.width_us != null) parts.push(`width_us = ${p.width_us}`);
    if (p.length_us != null) parts.push(`length_us = ${p.length_us}`);
    if (p.size_us) parts.push(`size_us = '${p.size_us.replace(/'/g, "''")}'`);
    if (p.name_us) parts.push(`name_us = '${p.name_us.replace(/'/g, "''")}'`);
    if (parts.length > 0) {
      sqlUpdates.push(`UPDATE public.products SET ${parts.join(', ')} WHERE id = ${p.id};`);
    }
  }

  updatedCount++;
}

// Write enriched catalog
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`Successfully enriched ${updatedCount} products in products-catalog.json with width_us, length_us, and size_us!`);

// Write updated SQL migration
const sqlHeader = `-- ============================================================
-- SQL Migration: Add width_us, length_us, and size_us to products
-- Width & Length (in mm) represent EU dimensions.
-- width_us & length_us (in inches) represent US dimensions.
-- size_us represents the official US standard name/label.
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS width_us NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS length_us NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS size_us VARCHAR(100);

-- Drop size_eu if previously added, as EU dimensions are in width & length (mm)
ALTER TABLE public.products DROP COLUMN IF EXISTS size_eu;

CREATE INDEX IF NOT EXISTS idx_products_width_us ON public.products (width_us);
CREATE INDEX IF NOT EXISTS idx_products_length_us ON public.products (length_us);
CREATE INDEX IF NOT EXISTS idx_products_size_us ON public.products (size_us);

-- ============================================================
-- Populate US dimensions and names for all products
-- ============================================================

`;

fs.writeFileSync(sqlPath, sqlHeader + sqlUpdates.join('\n') + '\n', 'utf8');
console.log(`Successfully generated updated ${sqlPath} with ${sqlUpdates.length} updates!`);

