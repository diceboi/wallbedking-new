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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const catalogPath = path.join(rootDir, 'src', 'data', 'products-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

async function syncSizes() {
  console.log('=== Syncing size_eu, size_us, and name_us to Supabase ===\n');

  // 1. Verify if columns exist by attempting to read them
  const checkRes = await fetch(`${supabaseUrl}/rest/v1/products?select=id,size_eu,size_us&limit=1`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!checkRes.ok) {
    const err = await checkRes.json();
    console.error('Error: Columns size_eu / size_us do not exist yet in Supabase products table.');
    console.error('Please run the migration in Supabase SQL Editor first: supabase/add_product_sizes.sql\n');
    console.error('Details:', err);
    process.exit(1);
  }

  console.log('✓ Columns size_eu and size_us verified in Supabase products table.');
  console.log(`Updating ${catalog.length} products...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const p of catalog) {
    const updatePayload = {};
    if (p.size_eu) updatePayload.size_eu = p.size_eu;
    if (p.size_us) updatePayload.size_us = p.size_us;
    if (p.name_us) updatePayload.name_us = p.name_us;

    if (Object.keys(updatePayload).length === 0) continue;

    const res = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${p.id}`, {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (res.ok) {
      successCount++;
    } else {
      failCount++;
      const text = await res.text();
      console.warn(`Failed to update product #${p.id}:`, text);
    }
  }

  console.log(`\n=== Sync Complete ===`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

syncSizes().catch(console.error);
