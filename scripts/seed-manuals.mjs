import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envFile = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    const k = trimmed.slice(0, idx).trim();
    let v = trimmed.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const STORAGE_BASE = `${supabaseUrl}/storage/v1/object/public/SupportFiles/InstallationManuals`;

const MANUALS = [
  'gf-morphy-horizontal-classic-double-2-assembly.pdf',
  'gf-morphy-horizontal-classic-double-assembly.pdf',
  'gf-morphy-horizontal-classic-large-assembly.pdf',
  'gf-morphy-horizontal-classic-single-assembly.pdf',
  'gf-morphy-horizontal-integrated-large-assembly.pdf',
  'gf-morphy-horizontal-studio-double-2-assembly.pdf',
  'gf-morphy-horizontal-studio-double-assembly.pdf',
  'gf-morphy-horizontal-studio-single-assembly.pdf',
  'gf-morphy-vertical-classic-double-2-assembly.pdf',
  'gf-morphy-vertical-classic-double-assembly.pdf',
  'gf-morphy-vertical-classic-large-assembly.pdf',
  'gf-morphy-vertical-classic-single-assembly.pdf',
  'gf-morphy-vertical-integrated-double-2-assembly.pdf',
  'gf-morphy-vertical-integrated-large-assembly.pdf',
  'gf-morphy-vertical-studio-double-2-assembly.pdf',
  'gf-morphy-vertical-studio-double-assembly.pdf',
  'gf-morphy-vertical-studio-large-assembly.pdf',
  'gf-morphy-vertical-studio-single-assembly.pdf'
];

function getManualFileName(product) {
  const isMorphy = ((product.name || '').includes('MORPHY') || (product.category || '').includes('MORPHY'));
  if (!isMorphy) return null;

  const orient = (product.orientation || 'Vertical').toLowerCase();
  const type = (product.type || 'Classic').toLowerCase();
  const minDim = Math.min(Number(product.width) || 0, Number(product.length) || 0);

  let sizeCat = 'single';
  if (minDim <= 1000) {
    sizeCat = 'single';
  } else if (minDim <= 1450) {
    sizeCat = (minDim >= 1350) ? 'double-2' : 'double';
  } else {
    sizeCat = 'large';
  }

  // Exact candidate
  let candidate = `gf-morphy-${orient}-${type}-${sizeCat}-assembly.pdf`;
  if (MANUALS.includes(candidate)) return candidate;

  // Alternate double fallback
  if (sizeCat === 'double-2') {
    candidate = `gf-morphy-${orient}-${type}-double-assembly.pdf`;
    if (MANUALS.includes(candidate)) return candidate;
  }
  if (sizeCat === 'double') {
    candidate = `gf-morphy-${orient}-${type}-double-2-assembly.pdf`;
    if (MANUALS.includes(candidate)) return candidate;
  }

  return null;
}

async function run() {
  const catalogPath = path.join(rootDir, 'src/data/products-catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  let mappedCount = 0;
  let inProgressCount = 0;

  for (const product of catalog) {
    const isMorphy = ((product.name || '').includes('MORPHY') || (product.category || '').includes('MORPHY'));
    if (!isMorphy) {
      if (!product.installation_manual) {
        product.installation_manual = null;
      }
      continue;
    }

    const manualFile = getManualFileName(product);
    if (manualFile) {
      product.installation_manual = `${STORAGE_BASE}/${manualFile}`;
      mappedCount++;
    } else {
      product.installation_manual = null;
      inProgressCount++;
    }
  }

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`[Catalog Updated] Mapped ${mappedCount} Morphy products to manuals. ${inProgressCount} products marked as In Progress.`);

  // Attempt Supabase database update if installation_manual column exists
  let dbSuccess = 0;
  let dbSkipped = false;
  for (const product of catalog) {
    if (!product.installation_manual) continue;
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${product.id}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ installation_manual: product.installation_manual })
      });
      if (res.ok) {
        dbSuccess++;
      } else {
        const err = await res.text();
        if (err.includes('installation_manual') || err.includes('column')) {
          console.log('[Notice] Supabase table does not yet have installation_manual column. User can run add_installation_manual.sql in Supabase SQL editor.');
          dbSkipped = true;
          break;
        }
      }
    } catch (e) {
      console.warn(`Failed DB update for product ${product.id}:`, e.message);
      break;
    }
  }

  if (!dbSkipped) {
    console.log(`[Supabase DB Updated] ${dbSuccess} records updated with installation_manual.`);
  }
}

run().catch(console.error);
