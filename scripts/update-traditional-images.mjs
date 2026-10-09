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
const SUPABASE_STORAGE_BASE = `${supabaseUrl}/storage/v1/object/public/ProductImages/wallbeds`;

const fileCounts = {
  '120x200-CH-TRADITIONAL': 9,
  '120x200-CV-TRADITIONAL': 9,
  '120x200-SH-TRADITIONAL': 7,
  '120x200-SV-TRADITIONAL': 7,
  '140x200-SH-TRADITIONAL': 7,
  '140x200-SV-TRADITIONAL': 7,
  '150x200-SH-TRADITIONAL': 7,
  '150x200-SV-TRADITIONAL': 7,
  '160x200-CH-TRADITIONAL': 9,
  '160x200-CV-TRADITIONAL': 9,
  '90x200-CH-TRADITIONAL': 9,
  '90x200-CV-TRADITIONAL': 9,
  '90x200-SH-TRADITIONAL': 8,
  '90x200-SV-TRADITIONAL': 7,
};

export function getTraditionalKey(item) {
  let bedWidthMm = Math.min(Number(item.width) || 0, Number(item.length) || 0);
  if (!bedWidthMm) bedWidthMm = Number(item.width) || Number(item.length) || 0;

  const isStudio = (item.type || '').toLowerCase().includes('studio');
  const isHoriz = (item.orientation || '').toLowerCase().includes('horiz');
  const typeCode = (isStudio ? 'S' : 'C') + (isHoriz ? 'H' : 'V');

  let sizeKey = '';
  if (bedWidthMm <= 1000) {
    sizeKey = '90x200';
  } else if (bedWidthMm <= 1250) {
    sizeKey = '120x200';
  } else if (isStudio) {
    if (bedWidthMm <= 1450) {
      sizeKey = '140x200';
    } else {
      sizeKey = '150x200';
    }
  } else {
    sizeKey = '160x200';
  }

  return `${sizeKey}-${typeCode}-TRADITIONAL`;
}

export function buildTraditionalImages(item) {
  const key = getTraditionalKey(item);
  const count = fileCounts[key];
  if (!count) {
    throw new Error(`Unknown traditional key: ${key}`);
  }

  const image1K = `${SUPABASE_STORAGE_BASE}/1K/${key}_1.webp`;
  const hoverImage1K = `${SUPABASE_STORAGE_BASE}/1K/${key}_2.webp`;

  const productImages = [];
  for (let i = 1; i <= count; i++) {
    productImages.push(`${SUPABASE_STORAGE_BASE}/1K/${key}_${i}.webp`);
  }

  return {
    image1K,
    hoverImage1K,
    productImages,
  };
}

async function run() {
  const catalogPath = path.join(rootDir, 'src', 'data', 'products-catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  let tradCount = 0;
  const updatesForDb = [];

  for (const item of catalog) {
    const isTradBed =
      item.parent_category === 'beds' &&
      item.id <= 44 &&
      !((item.name && item.name.includes('MORPHY')) || (item.category && item.category.includes('MORPHY')));

    if (isTradBed) {
      tradCount++;
      const imgs = buildTraditionalImages(item);
      item.image = imgs.image1K;
      item.hover_image = imgs.hoverImage1K;
      item.hoverImage = imgs.hoverImage1K;
      item.product_images = imgs.productImages;

      updatesForDb.push({
        id: item.id,
        name: item.name,
        image: imgs.image1K,
        hover_image: imgs.hoverImage1K,
        product_images: imgs.productImages,
      });
    }
  }

  console.log(`Updated ${tradCount} Traditional products in local catalog.`);
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');

  if (supabaseUrl && supabaseKey) {
    console.log(`Syncing ${updatesForDb.length} products to Supabase DB via PATCH...`);
    const chunkSize = 10;
    for (let i = 0; i < updatesForDb.length; i += chunkSize) {
      const chunk = updatesForDb.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (u) => {
          const res = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${u.id}`, {
            method: 'PATCH',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=representation',
            },
            body: JSON.stringify({
              image: u.image,
              hover_image: u.hover_image,
              product_images: u.product_images,
            }),
          });
          if (!res.ok) {
            console.error(`Failed to update product ${u.id} (${u.name}):`, res.status, await res.text());
          }
        })
      );
      console.log(`✓ Processed ${Math.min(i + chunkSize, updatesForDb.length)} / ${updatesForDb.length}`);
    }
    console.log('✓ Successfully updated all Traditional products in Supabase database!');
  }
}

run().catch(console.error);
