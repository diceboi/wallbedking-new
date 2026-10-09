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

// Official YouTube Video IDs & URLs
export const VIDEO_PRESETS = {
  morhyClassic: {
    id: '1MQ7Ksb2t-Y',
    url: 'https://www.youtube.com/watch?v=1MQ7Ksb2t-Y',
    title: 'Classic MORPHY™ Bed – 3D Animated Assembly & Installation Guide'
  },
  morphyStudio: {
    id: 'tz9-MVtDb7I',
    url: 'https://www.youtube.com/watch?v=tz9-MVtDb7I',
    title: 'Studio MORPHY™ Bed – 3D Animated Assembly & Installation Guide'
  },
  morphyIntegrated: {
    id: 'yyyw2hTSFII',
    url: 'https://www.youtube.com/watch?v=yyyw2hTSFII',
    title: 'Integrated MORPHY™ Bed – 3D Animated Assembly & Installation Guide'
  },
  traditionalClassic: {
    id: 'P-Bu-WuWakM',
    url: 'https://www.youtube.com/watch?v=P-Bu-WuWakM',
    title: 'Classic Wall Bed (Traditional) – Assembly & Installation Video'
  },
  traditionalStudio: {
    id: 'mD0vF1k075c',
    url: 'https://www.youtube.com/watch?v=mD0vF1k075c',
    title: 'Studio Wall Bed (Flat-Packed) – Assembly & Installation Guide'
  },
  cabinets: {
    id: 'o2dD3Qn7bKk',
    url: 'https://www.youtube.com/watch?v=o2dD3Qn7bKk',
    title: 'Cabinet & Storage Enclosure – Assembly Instructions'
  }
};

export function getVideoForProduct(product) {
  if (!product) return null;
  const category = (product.parent_category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const catName = (product.category || '').toLowerCase();
  const type = (product.sub_category || product.type || '').toLowerCase();
  const isMorphy = Boolean(
    product.isMorphy ?? (name.includes('morphy') || catName.includes('morphy'))
  );

  if (category === 'beds') {
    if (isMorphy) {
      if (type.includes('integrated')) return VIDEO_PRESETS.morphyIntegrated.url;
      if (type.includes('studio')) return VIDEO_PRESETS.morphyStudio.url;
      return VIDEO_PRESETS.morhyClassic.url;
    } else {
      if (type.includes('studio')) return VIDEO_PRESETS.traditionalStudio.url;
      return VIDEO_PRESETS.traditionalClassic.url;
    }
  }

  if (category === 'cabinets') {
    return VIDEO_PRESETS.cabinets.url;
  }

  return null;
}

async function run() {
  console.log('Testing column existence in Supabase...');
  const testRes = await fetch(`${supabaseUrl}/rest/v1/products?select=id,installation_video&limit=1`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });

  if (!testRes.ok) {
    const errText = await testRes.text();
    console.log('Column check returned status:', testRes.status, errText);
    if (errText.includes('column') && errText.includes('does not exist')) {
      console.log('Attempting to add column installation_video via SQL migration...');
      // Try calling rpc or pg_query or notify
      const sqlRes = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: 'ALTER TABLE public.products ADD COLUMN IF NOT EXISTS installation_video TEXT;' })
      });
      console.log('Migration response:', sqlRes.status, await sqlRes.text());
    }
  } else {
    console.log('Column installation_video already exists in Supabase table!');
  }

  // Update products-catalog.json
  const catalogPath = path.join(rootDir, 'src', 'data', 'products-catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  let mappedCount = 0;
  for (const p of catalog) {
    const videoUrl = getVideoForProduct(p);
    p.installation_video = videoUrl || null;
    if (videoUrl) mappedCount++;
  }

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`[Catalog Updated] Mapped ${mappedCount} products to installation videos out of ${catalog.length}.`);

  // Update Supabase DB
  let dbUpdated = 0;
  let dbFailed = 0;
  for (const p of catalog) {
    if (!p.id) continue;
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${p.id}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ installation_video: p.installation_video })
      });
      if (res.ok) {
        dbUpdated++;
      } else {
        dbFailed++;
      }
    } catch (e) {
      dbFailed++;
    }
  }

  console.log(`[Supabase DB Updated] ${dbUpdated} products updated with installation_video (${dbFailed} failed).`);
}

run();
