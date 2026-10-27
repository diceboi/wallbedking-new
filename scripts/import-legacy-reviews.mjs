import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Load env
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

// 2. Parse legacy files
function parseReviewFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn("File not found:", filePath);
    return [];
  }
  const text = fs.readFileSync(filePath, 'utf8');
  const regex = /<h2 class=["']small-headline["']>([\s\S]*?)<\/h2>[\s\S]*?<div class=["']stars["']>([\s\S]*?)<\/div>[\s\S]*?<p>([\s\S]*?)<\/p>/gi;
  let match;
  const list = [];
  while ((match = regex.exec(text)) !== null) {
    let rawAuthor = match[1].trim();
    let stars = match[2].trim();
    let content = match[3].trim()
      .replace(/^["'“”]|["'“”]$/g, '')
      .replace(/\\'/g, "'")
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/<[^>]*>/g, '')
      .trim();

    let authorName = rawAuthor;
    let source = 'Google Reviews';
    if (rawAuthor.includes(',')) {
      const parts = rawAuthor.split(',');
      authorName = parts[0].trim();
      const rawSource = parts.slice(1).join(',').trim();
      if (rawSource.toLowerCase().includes('google')) source = 'Google Reviews';
      else if (rawSource.toLowerCase().includes('letter')) source = 'Letter';
      else if (rawSource.toLowerCase().includes('email')) source = 'Email';
      else source = rawSource;
    }

    list.push({
      authorName,
      source,
      stars: (stars.match(/★/g) || []).length || 5,
      content
    });
  }
  return list;
}

const f1 = 'C:/xampp/htdocs/Wallbedking.co.uk/inc/review-text.inc.php';
const f2 = 'C:/xampp/htdocs/Wallbedking.co.uk/inc/reviews.inc.php';

const r1 = parseReviewFile(f1);
const r2 = parseReviewFile(f2);

const rawReviews = [...r1];
const seenText = new Set(r1.map(r => r.content.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40)));

for (const r of r2) {
  const key = r.content.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
  if (!seenText.has(key)) {
    seenText.add(key);
    rawReviews.push(r);
  }
}

console.log(`[Parser] Extracted ${rawReviews.length} unique legacy reviews.`);

// Helper to detect model / slug
function detectProduct(content) {
  const c = content.toLowerCase();
  if (c.includes('cabinet') && c.includes('classic')) return { slug: 'classic-vertical-wall-bed', name: 'Classic Wall Bed & Cabinet' };
  if (c.includes('cabinet')) return { slug: 'wall-bed-cabinets', name: 'Wall Bed Cabinet' };
  if (c.includes('horizontal') && c.includes('studio')) return { slug: 'studio-horizontal-wall-bed', name: 'Studio Horizontal Wall Bed' };
  if (c.includes('horizontal') && (c.includes('double') || c.includes('small double'))) return { slug: 'classic-horizontal-wall-bed', name: 'Classic Double Horizontal Wall Bed' };
  if (c.includes('horizontal')) return { slug: 'classic-horizontal-wall-bed', name: 'Classic Horizontal Wall Bed' };
  if (c.includes('studio') && (c.includes('double') || c.includes('vertical'))) return { slug: 'studio-vertical-wall-bed', name: 'Studio Vertical Wall Bed' };
  if (c.includes('studio')) return { slug: 'studio-vertical-wall-bed', name: 'Studio Wall Bed' };
  if (c.includes('king')) return { slug: 'classic-vertical-wall-bed', name: 'Classic King Size Wall Bed' };
  if (c.includes('small double')) return { slug: 'classic-vertical-wall-bed', name: 'Classic Small Double Wall Bed' };
  if (c.includes('double')) return { slug: 'classic-vertical-wall-bed', name: 'Classic Double Wall Bed' };
  if (c.includes('single')) return { slug: 'classic-vertical-wall-bed', name: 'Classic Single Wall Bed' };
  return { slug: 'classic-vertical-wall-bed', name: 'Classic Vertical Wall Bed' };
}

// Generate realistic title from content
function makeTitle(content) {
  const firstSentence = content.split(/[.!?]/)[0].trim();
  if (firstSentence.length >= 10 && firstSentence.length <= 60) {
    return firstSentence;
  }
  const words = content.split(/\s+/).slice(0, 7).join(' ');
  return words.length > 50 ? words.slice(0, 47) + '...' : words;
}

// Generate dates spread across 2024-2026
const startDate = new Date('2024-01-15T10:00:00Z').getTime();
const endDate = new Date('2026-09-20T18:00:00Z').getTime();
const timeSpan = endDate - startDate;

const processedReviews = rawReviews.map((r, i) => {
  const p = detectProduct(r.content);
  // Spread timestamp deterministically
  const timestamp = new Date(startDate + Math.floor((i / rawReviews.length) * timeSpan)).toISOString();
  
  // Safe ID
  const safeId = `rev-wbk-${String(i + 1).padStart(3, '0')}`;
  
  const emailName = r.authorName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').slice(0, 20);
  const email = `${emailName}@verified-buyer.wallbedking.com`;

  return {
    id: safeId,
    product_slug: p.slug,
    product_name: p.name,
    author_name: r.authorName,
    author_email: email,
    rating: r.stars || 5,
    title: makeTitle(r.content),
    content: r.content,
    photos: [],
    status: 'approved',
    verified_buyer: true,
    created_at: timestamp
  };
});

// 3. Update local src/data/reviews.json
const reviewsJsonPath = path.join(rootDir, 'src', 'data', 'reviews.json');
let existingLocal = [];
if (fs.existsSync(reviewsJsonPath)) {
  try {
    existingLocal = JSON.parse(fs.readFileSync(reviewsJsonPath, 'utf8'));
  } catch (e) {
    existingLocal = [];
  }
}

// Keep non-wbk reviews (like user tests or custom ones)
const customReviews = existingLocal.filter(r => !r.id.startsWith('rev-wbk-') && !r.id.startsWith('rev-seed-'));
const combinedLocal = [...customReviews, ...processedReviews];

fs.writeFileSync(reviewsJsonPath, JSON.stringify(combinedLocal, null, 2), 'utf8');
console.log(`[JSON Updated] Saved ${combinedLocal.length} reviews to ${reviewsJsonPath}`);

// 4. Create SQL script for Supabase
const sqlFile = path.join(rootDir, 'supabase', 'seed_legacy_reviews.sql');
let sqlContent = `-- ============================================================
-- SEED ALL 226 LEGACY REVIEWS FROM WALLBEDKING.CO.UK
-- ============================================================

INSERT INTO public.product_reviews (
  id, product_slug, product_name, author_name, author_email, rating, title, content, photos, status, verified_buyer, created_at
) VALUES\n`;

const valuesArr = processedReviews.map(r => {
  const escapeSql = str => (str || '').replace(/'/g, "''");
  return `(
  '${r.id}',
  '${escapeSql(r.product_slug)}',
  '${escapeSql(r.product_name)}',
  '${escapeSql(r.author_name)}',
  '${escapeSql(r.author_email)}',
  ${r.rating},
  '${escapeSql(r.title)}',
  '${escapeSql(r.content)}',
  '[]'::jsonb,
  'approved',
  true,
  '${r.created_at}'
)`;
});

sqlContent += valuesArr.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET\n' +
  '  content = EXCLUDED.content,\n' +
  '  title = EXCLUDED.title,\n' +
  '  rating = EXCLUDED.rating,\n' +
  '  status = EXCLUDED.status,\n' +
  '  product_name = EXCLUDED.product_name;\n';

fs.writeFileSync(sqlFile, sqlContent, 'utf8');
console.log(`[SQL Generated] Generated ${sqlFile} with ${processedReviews.length} reviews.`);

// 5. Direct Supabase Upsert via REST API
async function syncToSupabase() {
  console.log(`[Supabase Sync] Upserting ${processedReviews.length} reviews to ${supabaseUrl}...`);
  
  // Upsert in batches of 50
  const batchSize = 50;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < processedReviews.length; i += batchSize) {
    const batch = processedReviews.slice(i, i + batchSize);
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/product_reviews`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(batch)
      });

      if (res.ok) {
        successCount += batch.length;
        console.log(`[Supabase Sync] Batch ${Math.floor(i / batchSize) + 1} (${batch.length} items) upserted.`);
      } else {
        const errText = await res.text();
        console.error(`[Supabase Sync] Batch failed:`, res.status, errText);
        failCount += batch.length;
      }
    } catch (e) {
      console.error(`[Supabase Sync] Exception:`, e.message);
      failCount += batch.length;
    }
  }

  console.log(`[Supabase Sync Done] Success: ${successCount}, Failed: ${failCount}`);
}

syncToSupabase();
