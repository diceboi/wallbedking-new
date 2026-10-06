import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env.local
const envFile = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx > -1) {
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_STORAGE_BASE = `${supabaseUrl}/storage/v1/object/public/ProductImages`;

export function getMorphySizeKey(item) {
  let bedWidthMm = Math.min(Number(item.width) || 0, Number(item.length) || 0);
  if (!bedWidthMm) bedWidthMm = Number(item.width) || Number(item.length) || 0;

  if (bedWidthMm < 1000) return '90x200';
  if (bedWidthMm < 1350) return '120x200';
  if (bedWidthMm <= 1920) return '160x200';
  return '200x200';
}

export function getMorphyTypeCode(item) {
  const t = (item.type || item.sub_category || '').toLowerCase();
  const o = (item.orientation || '').toLowerCase();

  let prefix = 'C';
  if (t.includes('studio')) prefix = 'S';
  else if (t.includes('integrated')) prefix = 'I';

  let suffix = 'V';
  if (o.includes('horizontal') || o.includes('h')) suffix = 'H';

  return `${prefix}${suffix}`;
}

export function buildMorphyImages(item) {
  const sizeKey = getMorphySizeKey(item);
  const typeCode = getMorphyTypeCode(item);
  const baseName = `${sizeKey}-${typeCode}-MORPHY`;

  const image1K = `${SUPABASE_STORAGE_BASE}/1K/${baseName}_1.webp`;
  const hoverImage1K = `${SUPABASE_STORAGE_BASE}/1K/${baseName}_1-m.webp`;
  const image2K = `${SUPABASE_STORAGE_BASE}/2K/${baseName}_1.webp`;
  const hoverImage2K = `${SUPABASE_STORAGE_BASE}/2K/${baseName}_1-m.webp`;

  const productImages2K = [
    `${SUPABASE_STORAGE_BASE}/2K/${baseName}_1.webp`,
    `${SUPABASE_STORAGE_BASE}/2K/${baseName}_1-m.webp`,
  ];
  for (let i = 2; i <= 12; i++) {
    productImages2K.push(`${SUPABASE_STORAGE_BASE}/2K/${baseName}_${i}.webp`);
  }

  return {
    image1K,
    hoverImage1K,
    image2K,
    hoverImage2K,
    productImages2K,
  };
}

async function run() {
  const catalogPath = path.join(rootDir, 'src', 'data', 'products-catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  let morphyCount = 0;
  const updatesForDb = [];

  for (const item of catalog) {
    const isMorphy = item.parent_category === 'beds' && (
      (item.name && item.name.includes('MORPHY')) ||
      (item.category && item.category.includes('MORPHY'))
    );

    if (isMorphy) {
      morphyCount++;
      const imgs = buildMorphyImages(item);
      item.image = imgs.image1K;
      item.hover_image = imgs.hoverImage1K;
      item.hoverImage = imgs.hoverImage1K;
      item.product_images = imgs.productImages2K;

      updatesForDb.push({
        id: item.id,
        image: imgs.image1K,
        hover_image: imgs.hoverImage1K,
        product_images: imgs.productImages2K,
      });
    }
  }

  console.log(`Updated ${morphyCount} Morphy products in catalog.`);
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');

  if (supabaseUrl && supabaseKey) {
    console.log(`Syncing ${updatesForDb.length} products to Supabase DB via PATCH...`);
    // Run in parallel chunks of 10
    const chunkSize = 10;
    for (let i = 0; i < updatesForDb.length; i += chunkSize) {
      const chunk = updatesForDb.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (u) => {
        const res = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${u.id}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: u.image,
            hover_image: u.hover_image,
            product_images: u.product_images,
          }),
        });
        if (!res.ok) {
          console.error(`Failed to update product ${u.id}:`, res.status, await res.text());
        }
      }));
      console.log(`✓ Processed ${Math.min(i + chunkSize, updatesForDb.length)} / ${updatesForDb.length}`);
    }
    console.log('✓ Successfully updated all Morphy products in Supabase database!');
  }
}

run().catch(console.error);
