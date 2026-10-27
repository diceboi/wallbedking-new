import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const settingsPath = path.join(rootDir, "src", "data", "shipping_payment_settings.json");
const outputPath = path.join(rootDir, "supabase", "checkout_settings.sql");

const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));

let sql = `-- ============================================================
-- WALLBEDKING CHECKOUT, SHIPPING & PAYMENT SETTINGS SCHEMA
-- Table: public.checkout_settings
-- Run this script in your Supabase SQL Editor.
-- ============================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.checkout_settings (
  locale TEXT PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.checkout_settings ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to prevent conflicts on re-run
DROP POLICY IF EXISTS "Allow public read checkout_settings" ON public.checkout_settings;
DROP POLICY IF EXISTS "Allow service role all checkout_settings" ON public.checkout_settings;
DROP POLICY IF EXISTS "Allow authenticated all checkout_settings" ON public.checkout_settings;

-- 4. Policies:
-- Public storefronts (guest and logged-in visitors) can read checkout configurations
CREATE POLICY "Allow public read checkout_settings" ON public.checkout_settings
  FOR SELECT USING (true);

-- Backend API & Service Role full management
CREATE POLICY "Allow service role all checkout_settings" ON public.checkout_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Authenticated admins full management
CREATE POLICY "Allow authenticated all checkout_settings" ON public.checkout_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Seed initial settings for all 7 markets (UK, US, DE, FR, ES, POR, IT)
`;

for (const [locale, config] of Object.entries(settings)) {
  const jsonStr = JSON.stringify(config, null, 2);
  sql += `INSERT INTO public.checkout_settings (locale, config, updated_at)
VALUES (
  '${locale}',
  $BODY$${jsonStr}$BODY$::jsonb,
  NOW()
)
ON CONFLICT (locale) DO UPDATE 
SET config = EXCLUDED.config,
    updated_at = NOW();

`;
}

fs.writeFileSync(outputPath, sql, "utf-8");
console.log(`Generated ${outputPath} successfully (${sql.length} bytes).`);
