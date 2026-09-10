import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

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

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: class DummyWS {} }
});

// Robust CSV Parser supporting quotes and multi-line strings
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

async function runSync() {
  console.log('=== WallBedKing Product Database Synchronization ===\n');

  const enrichedCsvPath = path.join(rootDir, 'products_rows_enriched.csv');
  if (!fs.existsSync(enrichedCsvPath)) {
    console.error('Error: products_rows_enriched.csv not found in root directory.');
    process.exit(1);
  }

  const rawText = fs.readFileSync(enrichedCsvPath, 'utf8');
  const rows = parseCSV(rawText);
  const headers = rows[0].map(h => h.trim());
  const dataRows = rows.slice(1);

  console.log(`Parsed ${dataRows.length} rows from products_rows_enriched.csv.`);

  // Convert to structured products array
  const products = dataRows.map((r) => {
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

    // Compute composite package_dimensions if empty
    if (!obj.package_dimensions) {
      const boxes = [obj.pack_1, obj.pack_2, obj.pack_3, obj.pack_4].filter(Boolean);
      if (boxes.length > 0) {
        obj.package_dimensions = boxes.map((b, i) => `Box ${i + 1}: ${b} cm`).join(' | ');
      }
    }

    return obj;
  });

  // 1. Update local products-catalog.json
  const catalogJsonPath = path.join(rootDir, 'src', 'data', 'products-catalog.json');
  fs.writeFileSync(catalogJsonPath, JSON.stringify(products, null, 2), 'utf8');
  console.log(`✓ Updated src/data/products-catalog.json with ${products.length} enriched products.`);

  // 2. Update local products-raw.csv
  const rawCsvPath = path.join(rootDir, 'src', 'data', 'products-raw.csv');
  fs.copyFileSync(enrichedCsvPath, rawCsvPath);
  console.log(`✓ Synced products_rows_enriched.csv to src/data/products-raw.csv.`);

  // 3. Check Supabase columns availability
  console.log('\nChecking Supabase database schema...');
  let hasSkuColumn = false;
  try {
    const { data, error } = await supabase.from('products').select('id, sku').limit(1);
    if (!error) {
      hasSkuColumn = true;
      console.log('✓ Column `sku` detected in Supabase products table.');
    } else {
      console.log('Notice: Column `sku` not yet present in Supabase table:', error.message);
    }
  } catch (err) {
    console.log('Notice:', err.message);
  }

  // 4. Sync to Supabase
  console.log('\nSyncing enriched product data to Supabase...');
  const BATCH_SIZE = 25;
  let updatedCount = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    // Filter payload based on whether new columns exist in Supabase
    const payload = batch.map((p) => {
      const row = {
        id: p.id,
        name: p.name,
        slug: p.slug,
        ean: p.ean,
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
        stock: p.stock ?? 100,
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
        backorder: p.backorder ?? true,
        visibility: p.visibility || 'Visible',
        warranty: p.warranty,
        description: p.description,
        image: p.image,
        hover_image: p.hover_image,
        product_images: p.product_images,
        product_image_alt: p.product_image_alt,
        meta_title: p.meta_title,
        meta_description: p.meta_description,
        has_3d: p.has_3d,
        updated_at: new Date().toISOString(),
      };

      if (hasSkuColumn) {
        row.sku = p.sku;
        row.ean_uk = p.ean_uk;
        row.ean_us = p.ean_us;
        row.ean_de = p.ean_de;
        row.ean_fr = p.ean_fr;
        row.ean_es = p.ean_es;
        row.ean_it = p.ean_it;
        row.ean_pt = p.ean_pt;
        row.pack_1 = p.pack_1;
        row.pack_2 = p.pack_2;
        row.pack_3 = p.pack_3;
        row.pack_4 = p.pack_4;
      }

      return row;
    });

    const { error: upsertError } = await supabase
      .from('products')
      .upsert(payload, { onConflict: 'id' });

    if (upsertError) {
      console.error(`Error syncing batch ${i + 1}-${i + batch.length}:`, upsertError.message);
    } else {
      updatedCount += batch.length;
      process.stdout.write(`Synced ${updatedCount} / ${products.length} products...\r`);
    }
  }

  console.log(`\n✓ Supabase sync completed: ${updatedCount} products updated.`);

  if (!hasSkuColumn) {
    console.log('\n👉 REMINDER FOR SUPABASE SCHEMA:');
    console.log('To enable dedicated `sku`, country-specific EANs, and `pack_1..4` columns in Supabase:');
    console.log('Run the script in: supabase/add_enriched_columns.sql in the Supabase SQL Editor.');
    console.log('After running it, run `node scripts/sync-enriched-catalog.mjs` again to populate those dedicated columns in Supabase.');
  }

  console.log('\nAll local JSON and raw catalog files are 100% synchronized with enriched SKU, weights, and EANs!');
}

runSync().catch(console.error);
