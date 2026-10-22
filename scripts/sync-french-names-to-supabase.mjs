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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('No supabase credentials found, skipping live DB update.');
  process.exit(0);
}

const catalogPath = path.join(rootDir, 'src', 'data', 'products-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

async function syncFrenchNames() {
  console.log('=== Syncing name_fr and title_fr to Supabase ===\n');

  let successCount = 0;
  let failCount = 0;

  for (const item of catalog) {
    if (!item.id || !item.name_fr) continue;

    const payload = {
      name_fr: item.name_fr,
    };

    try {
      const patchRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.id}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
      });

      if (patchRes.ok) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (err) {
      failCount++;
    }
  }

  console.log(`\n✓ Successfully updated ${successCount} products in Supabase.`);
  if (failCount > 0) {
    console.log(`  Failed updates: ${failCount}`);
  }
}

syncFrenchNames();
