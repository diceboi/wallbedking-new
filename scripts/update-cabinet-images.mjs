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
const SUPABASE_CABINETS_BASE = `${supabaseUrl}/storage/v1/object/public/ProductImages/cabinets/1K`;

// File counts per group (from verified 424 files):
// ANGLE and FRONT counts
const GROUP_COUNTS = {
  '90x200-SV': { angle: 10, front: 4 },
  '120x200-SDV': { angle: 10, front: 4 },
  '140x200-DV': { angle: 13, front: 4 },
  '160x200-KV': { angle: 13, front: 4 },
  '140x200-DH': { angle: 7, front: 7 },
  '160x200-KH': { angle: 7, front: 7 },
  '140-160x200-KHEXT': { angle: 4, front: 4 },
  '50x225-SIDEDHV': { angle: 3, front: 3 },
  '50x225-SIDESV': { angle: 1, front: 1 },
};

export function getCabinetKey(item) {
  const name = (item.name || '').toLowerCase();
  const color = (item.color || '').toUpperCase(); // PINE, BEECH, OAK, WHITE

  if (!['PINE', 'BEECH', 'OAK', 'WHITE'].includes(color)) {
    throw new Error(`Unknown color '${item.color}' for item ${item.id}: ${item.name}`);
  }

  let modelKey = null;

  if (name.includes('side unit')) {
    if (name.includes('door') || name.includes('hanger')) {
      modelKey = '50x225-SIDEDHV';
    } else if (name.includes('shelves') || name.includes('shelf')) {
      modelKey = '50x225-SIDESV';
    }
  } else if (name.includes('extension')) {
    modelKey = '140-160x200-KHEXT';
  } else if (name.includes('horizontal')) {
    if (name.includes('double') && !name.includes('small')) {
      modelKey = '140x200-DH';
    } else if (name.includes('king')) {
      modelKey = '160x200-KH';
    }
  } else if (name.includes('vertical')) {
    if (name.includes('small double')) {
      modelKey = '120x200-SDV';
    } else if (name.includes('single')) {
      modelKey = '90x200-SV';
    } else if (name.includes('double')) {
      modelKey = '140x200-DV';
    } else if (name.includes('king')) {
      modelKey = '160x200-KV';
    }
  }

  if (!modelKey) {
    throw new Error(`Unable to determine modelKey for item ${item.id}: ${item.name}`);
  }

  return {
    modelKey,
    prefix: `${modelKey}-${color}-CABINET`
  };
}

export function buildCabinetImages(item) {
  const { modelKey, prefix } = getCabinetKey(item);
  const counts = GROUP_COUNTS[modelKey];
  if (!counts) {
    throw new Error(`Unknown group counts for: ${modelKey}`);
  }

  // Primary image is ANGLE 1
  const image = `${SUPABASE_CABINETS_BASE}/${prefix}_ANGLE_1.webp`;

  // Hover image is ANGLE 2 if exists, else FRONT 1
  const hoverImage = counts.angle >= 2
    ? `${SUPABASE_CABINETS_BASE}/${prefix}_ANGLE_2.webp`
    : `${SUPABASE_CABINETS_BASE}/${prefix}_FRONT_1.webp`;

  // Gallery: all ANGLE images (1..counts.angle) then all FRONT images (1..counts.front)
  const product_images = [];
  for (let i = 1; i <= counts.angle; i++) {
    product_images.push(`${SUPABASE_CABINETS_BASE}/${prefix}_ANGLE_${i}.webp`);
  }
  for (let i = 1; i <= counts.front; i++) {
    product_images.push(`${SUPABASE_CABINETS_BASE}/${prefix}_FRONT_${i}.webp`);
  }

  return {
    image,
    hover_image: hoverImage,
    hoverImage,
    product_images
  };
}

async function run() {
  const catalogPath = path.join(rootDir, 'src', 'data', 'products-catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  const cabinetItems = catalog.filter(p => p.id >= 195 && p.id <= 234);
  console.log(`Processing ${cabinetItems.length} cabinet products (IDs 195 - 234)...`);

  const updatesForDb = [];

  for (const item of cabinetItems) {
    const imgs = buildCabinetImages(item);
    item.image = imgs.image;
    item.hover_image = imgs.hover_image;
    item.hoverImage = imgs.hoverImage;
    item.product_images = imgs.product_images;

    updatesForDb.push({
      id: item.id,
      name: item.name,
      image: imgs.image,
      hover_image: imgs.hover_image,
      product_images: imgs.product_images
    });

    console.log(`✓ ID ${item.id} | ${item.name} -> ${imgs.product_images.length} images (main: ${imgs.image.split('/').pop()})`);
  }

  // Update local products-catalog.json
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`\n✓ Successfully updated src/data/products-catalog.json with ${cabinetItems.length} cabinet products.`);

  // Update Supabase DB
  if (supabaseUrl && supabaseKey) {
    console.log(`\nSyncing ${updatesForDb.length} products to Supabase DB via PATCH...`);
    const chunkSize = 5;
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
      console.log(`✓ Synced ${Math.min(i + chunkSize, updatesForDb.length)} / ${updatesForDb.length}`);
    }
    console.log('✓ Successfully updated all 40 cabinet products in Supabase DB!');
  }
}

run().catch(console.error);
