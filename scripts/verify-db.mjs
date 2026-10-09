import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync('.env.local', 'utf8');
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
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const res = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name,installation_video,installation_manual&limit=6`, {
  headers: {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`
  }
});

const data = await res.json();
console.log('Sample rows from Supabase DB:');
console.log(JSON.stringify(data, null, 2));
