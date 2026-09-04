import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env.local
const envPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://unrqbejocbteebsworuq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase REST endpoint
const supabaseRestUrl = `${supabaseUrl}/rest/v1/products`;
const supabaseHeaders = {
  'Content-Type': 'application/json',
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Prefer': 'resolution=merge-duplicates'
};

// CSV Parser Helper supporting quotes and commas
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
      if (row.length > 1 || row[0] !== '') {
        lines.push(row);
      }
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

const csvFile = path.join(rootDir, 'src', 'data', 'products-raw.csv');
const rawText = fs.readFileSync(csvFile, 'utf8');
const rows = parseCSV(rawText);
const header = rows[0].map(h => h.trim());
const dataRows = rows.slice(1);

console.log(`Parsed ${dataRows.length} product rows from CSV.`);

const MORPHY_GALLERY = [
  "/product-images/morphy-integrated/160x200.jpg",
  "/product-images/morphy-integrated/160x200-2.jpg",
  "/product-images/morphy-integrated/160x200-3.jpg",
  "/product-images/morphy-integrated/160x200-4.jpg",
  "/product-images/morphy-integrated/160x200-5.jpg",
  "/product-images/morphy-integrated/160x200-6.jpg",
  "/product-images/morphy-integrated/160x200-7.jpg",
  "/product-images/morphy-integrated/160x200-8.jpg",
  "/product-images/morphy-integrated/160x200-9.jpg",
  "/product-images/morphy-integrated/160x200-10.jpg",
  "/product-images/morphy-integrated/160x200-11.jpg",
  "/product-images/morphy-integrated/160x200-12.jpg"
];

const SOFA_GALLERY = [
  "/sofa1.webp",
  "/sofa2.webp",
  "/sofa3.webp",
  "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
  "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp"
];

const CLASSIC_GALLERY = [
  "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
  "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
  "/product-images/morphy-integrated/160x200-4.jpg",
  "/product-images/morphy-integrated/160x200-6.jpg",
  "/product-images/morphy-integrated/160x200-8.jpg"
];

const MATTRESS_GALLERY = [
  "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
  "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp"
];

const CABINET_GALLERY = [
  "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
  "/product-images/morphy-integrated/160x200-8.jpg"
];

const seenSlugs = new Map();
const products = dataRows.map((r) => {
  const obj = {};
  header.forEach((h, idx) => {
    obj[h] = r[idx] ? r[idx].trim() : '';
  });

  const cat = obj['Category'] || '';
  let parentCategory = 'beds';
  if (cat.startsWith('Sofas')) parentCategory = 'sofas';
  else if (cat.startsWith('Mattresses')) parentCategory = 'mattresses';
  else if (cat.startsWith('Cabinets')) parentCategory = 'cabinets';
  else if (cat.startsWith('Base Beds') || cat.startsWith('MORPHY™ Beds')) parentCategory = 'beds';

  const parts = cat.split('>').map(p => p.trim());
  const subCategory = parts[parts.length - 1] || obj['Type'] || '';

  const isIntegrated = (obj['Type'] === 'Integrated') || obj['Name'].toLowerCase().includes('integrated');
  const isSofa = parentCategory === 'sofas';
  const isMattress = parentCategory === 'mattresses';
  const isCabinet = parentCategory === 'cabinets';

  let image = '/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp';
  let hoverImage = '/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp';
  let productImages = CLASSIC_GALLERY;

  if (isIntegrated) {
    image = '/product-images/morphy-integrated/160x200.jpg';
    hoverImage = '/product-images/morphy-integrated/160x200-3.jpg';
    productImages = MORPHY_GALLERY;
  } else if (isSofa) {
    image = obj['Color'] === 'Grey' ? '/sofa2.webp' : '/sofa1.webp';
    hoverImage = '/sofa3.webp';
    productImages = SOFA_GALLERY;
  } else if (isMattress) {
    image = '/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp';
    hoverImage = '/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp';
    productImages = MATTRESS_GALLERY;
  } else if (isCabinet) {
    image = '/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp';
    hoverImage = '/product-images/morphy-integrated/160x200-8.jpg';
    productImages = CABINET_GALLERY;
  }

  // Size label from width/length
  const w = parseInt(obj['Width']) || 0;
  const l = parseInt(obj['Length']) || 0;
  let sizeCategory = 'Single';
  if (w <= 800) sizeCategory = 'Small Single';
  else if (w <= 1000) sizeCategory = 'Single';
  else if (w <= 1200) sizeCategory = 'Small Double';
  else if (w <= 1400) sizeCategory = 'Double';
  else if (w <= 1600) sizeCategory = 'King';
  else if (w > 1600) sizeCategory = 'Super King';

  const sizeDimensions = (w && l) ? `${w / 10} x ${l / 10}` : (w ? `${w / 10} cm` : '');
  const sizeLabel = `${sizeCategory}${sizeDimensions ? ` ${sizeDimensions}` : ''}`;

  let finalSlug = obj['Slug'] || obj['Name'].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (seenSlugs.has(finalSlug)) {
    const count = seenSlugs.get(finalSlug) + 1;
    seenSlugs.set(finalSlug, count);
    const colorSuffix = obj['Color'] ? `-${obj['Color'].toLowerCase()}` : '';
    finalSlug = `${finalSlug}${colorSuffix}-${obj['ID']}`;
  } else {
    seenSlugs.set(finalSlug, 1);
  }

  return {
    id: parseInt(obj['ID']),
    ean: obj['EAN'],
    name: obj['Name'],
    slug: finalSlug,
    width: parseInt(obj['Width']) || null,
    length: parseInt(obj['Length']) || null,
    height: parseInt(obj['Height']) || null,
    frame_width: parseInt(obj['Frame width']) || null,
    folded_up_height: parseInt(obj['Folded up height']) || null,
    folded_up_projection: parseInt(obj['Folded up projection']) || null,
    folded_down_projection: parseInt(obj['Folded down projection']) || null,
    frame_distance_from_ground: parseInt(obj['Frame distance from ground']) || null,
    mounting_frame_height: parseInt(obj['Mounting frame height']) || null,
    maximum_mattress_depth: parseInt(obj['Maximum mattress depth']) || null,
    orientation: obj['Orientation'] || 'Vertical',
    type: obj['Type'] || 'Classic',
    color: obj['Color'] || 'Black',
    weight: parseFloat(obj['Weight']) || null,
    stock: parseInt(obj['Stock']) || 100,
    package_dimensions: obj['Package Dimensions'] || null,
    price_gbp: parseFloat(obj['Price GBP']) || 0,
    price_euro: parseFloat(obj['Price EURO']) || null,
    price_usd: parseFloat(obj['Price USD']) || null,
    sale_percent: parseFloat(obj['Sale Percent']) || null,
    sale_fix_gbp: parseFloat(obj['Sale Fix GBP']) || null,
    sale_fix_euro: parseFloat(obj['Sale Fix EURO']) || null,
    sale_fix_usd: parseFloat(obj['Sale Fix USD']) || null,
    sale_price_gbp: parseFloat(obj['Sale Price GBP']) || null,
    sale_price_euro: parseFloat(obj['Sale Price EURO']) || null,
    sale_price_usd: parseFloat(obj['Sale Price USD']) || null,
    category: obj['Category'],
    parent_category: parentCategory,
    sub_category: subCategory,
    size_category: sizeCategory,
    size_label: sizeLabel,
    backorder: obj['Backorder'] === 'TRUE',
    visibility: obj['Visibility'] || 'Visible',
    warranty: obj['Warranty'] || 'Lifetime',
    description: obj['Description'] || '',
    image: image,
    hover_image: hoverImage,
    product_images: productImages,
    product_image_alt: obj['Product Image Alt'] || obj['Name'],
    meta_title: obj['Meta Title'] || obj['Name'],
    meta_description: obj['Description'] || '',
    has_3d: isIntegrated
  };
});

// Save structured JSON
const outJson = path.join(rootDir, 'src', 'data', 'products-catalog.json');
fs.writeFileSync(outJson, JSON.stringify(products, null, 2));
console.log(`Saved ${products.length} products to src/data/products-catalog.json`);

// Upsert to Supabase
async function syncToSupabase() {
  try {
    console.log('Attempting to upsert to Supabase "products" table...');

    // Filter to only match database table schema columns
    const dbPayload = products.map((p) => ({
      id: p.id,
      ean: p.ean || null,
      ean_uk: p.ean_uk || p.ean || null,
      ean_us: p.ean_us || null,
      ean_de: p.ean_de || null,
      ean_fr: p.ean_fr || null,
      ean_es: p.ean_es || null,
      ean_it: p.ean_it || null,
      ean_pt: p.ean_pt || null,
      name: p.name,
      slug: p.slug,
      width: p.width,
      length: p.length,
      height: p.height,
      frame_width: p.frame_width,
      folded_up_height: p.folded_up_height,
      folded_up_projection: p.folded_up_projection,
      folded_down_projection: p.folded_down_projection,
      frame_distance_from_ground: p.frame_distance_from_ground,
      mounting_frame_height: p.mounting_frame_height,
      maximum_mattress_depth: p.maximum_mattress_depth,
      orientation: p.orientation,
      type: p.type,
      color: p.color,
      weight: p.weight,
      stock: p.stock,
      package_dimensions: p.package_dimensions,
      price_gbp: p.price_gbp,
      price_euro: p.price_euro,
      price_usd: p.price_usd,
      sale_percent: p.sale_percent,
      sale_fix_gbp: p.sale_fix_gbp,
      sale_fix_euro: p.sale_fix_euro,
      sale_fix_usd: p.sale_fix_usd,
      sale_price_gbp: p.sale_price_gbp,
      sale_price_euro: p.sale_price_euro,
      sale_price_usd: p.sale_price_usd,
      category: p.category,
      parent_category: p.parent_category,
      sub_category: p.sub_category,
      backorder: p.backorder,
      visibility: p.visibility,
      warranty: p.warranty,
      description: p.description,
      image: p.image,
      hover_image: p.hover_image,
      product_images: p.product_images,
      product_image_alt: p.product_image_alt,
      meta_title: p.meta_title,
      meta_description: p.meta_description,
      has_3d: p.has_3d
    }));

    for (let i = 0; i < dbPayload.length; i += 50) {
      const batch = dbPayload.slice(i, i + 50);
      const res = await fetch(supabaseRestUrl, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(batch)
      });
      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Batch ${i}-${i + batch.length} Supabase status (${res.status}):`, errText);
      } else {
        console.log(`Batch ${i}-${i + batch.length} uploaded successfully!`);
      }
    }
  } catch (err) {
    console.error('Supabase sync error:', err.message);
  }
}

syncToSupabase().then(() => {
  console.log('Seed process finished!');
});
