-- ============================================================
-- WALLBEDKING DATABASE SCHEMA: Navigation Menu
-- ============================================================
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run

-- 1. Create table public.navigation_menu
CREATE TABLE IF NOT EXISTS public.navigation_menu (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'category', -- 'category' | 'custom'
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT,
  href TEXT NOT NULL,
  order_index INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  has_submenu BOOLEAN DEFAULT true,
  badge TEXT DEFAULT '',
  available_locales TEXT[] DEFAULT '{en,us,de,fr,es,por,it}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure column exists if table was created earlier
ALTER TABLE public.navigation_menu
  ADD COLUMN IF NOT EXISTS available_locales TEXT[] DEFAULT '{en,us,de,fr,es,por,it}';

-- 2. Indices
CREATE INDEX IF NOT EXISTS idx_navigation_menu_order ON public.navigation_menu (order_index);
CREATE INDEX IF NOT EXISTS idx_navigation_menu_visible ON public.navigation_menu (is_visible);
CREATE INDEX IF NOT EXISTS idx_navigation_menu_available_locales ON public.navigation_menu USING GIN (available_locales);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.navigation_menu ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Public (anonymous + authenticated) can view visible menu items
DROP POLICY IF EXISTS "Public can view navigation items" ON public.navigation_menu;
CREATE POLICY "Public can view navigation items" ON public.navigation_menu
  FOR SELECT USING (true);

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on navigation" ON public.navigation_menu;
CREATE POLICY "Service role full access on navigation" ON public.navigation_menu
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users full access
DROP POLICY IF EXISTS "Authenticated users full access on navigation" ON public.navigation_menu;
CREATE POLICY "Authenticated users full access on navigation" ON public.navigation_menu
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Seed initial menu items with current regional visibility
INSERT INTO public.navigation_menu (id, title, type, category_id, slug, href, order_index, is_visible, has_submenu, badge, available_locales)
VALUES
  ('morphyBeds', 'Wall Beds', 'category', 'beds', 'morphy-beds', '/products/beds?collection=morphy', 1, true, true, 'New Gen', ARRAY['en','us','de','fr','es','por','it']::TEXT[]),
  ('tables', 'Smart Tables & Chairs', 'category', 'tables', 'tables', '/products/tables', 2, true, true, '', ARRAY['en']::TEXT[]),
  ('cabinets', 'Cabinets & Units', 'category', 'cabinets', 'cabinets', '/products/cabinets', 3, true, true, '', ARRAY['en','de','fr','es','por','it']::TEXT[]),
  ('mattresses', 'Mattresses', 'category', 'mattresses', 'mattresses', '/products/mattresses', 4, true, true, '', ARRAY['en','de','fr','es','por','it']::TEXT[]),
  ('traditionalBeds', 'Clearance', 'category', 'beds', 'traditional-beds', '/products/beds?collection=traditional', 5, true, true, '%', ARRAY['en','de','fr','es','por','it']::TEXT[]),
  ('more', 'More', 'custom', NULL, 'more', '/support/delivery', 6, true, true, '', ARRAY['en','us','de','fr','es','por','it']::TEXT[]),
  ('sofas', 'Sofas', 'category', 'sofas', 'sofas', '/products/sofas', 7, false, true, '', ARRAY['en','us','de','fr','es','por','it']::TEXT[]),
  ('extras', 'Extras & Accessories', 'category', 'extras', 'extras', '/products/extras', 8, false, true, '', ARRAY['en','us','de','fr','es','por','it']::TEXT[]),
  ('beds', 'Wall Beds', 'category', 'beds', 'beds', '/products/beds', 9, false, true, '', ARRAY['en','us','de','fr','es','por','it']::TEXT[]),
  ('support', 'Support & Guides', 'custom', NULL, 'support', '/support/faq', 10, false, true, '', ARRAY['en','us','de','fr','es','por','it']::TEXT[])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  category_id = EXCLUDED.category_id,
  slug = EXCLUDED.slug,
  href = EXCLUDED.href,
  order_index = EXCLUDED.order_index,
  is_visible = EXCLUDED.is_visible,
  has_submenu = EXCLUDED.has_submenu,
  badge = EXCLUDED.badge,
  available_locales = EXCLUDED.available_locales,
  updated_at = NOW();
