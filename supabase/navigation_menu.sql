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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indices
CREATE INDEX IF NOT EXISTS idx_navigation_menu_order ON public.navigation_menu (order_index);
CREATE INDEX IF NOT EXISTS idx_navigation_menu_visible ON public.navigation_menu (is_visible);

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

-- 5. Seed initial menu items
INSERT INTO public.navigation_menu (id, title, type, category_id, slug, href, order_index, is_visible, has_submenu, badge)
VALUES
  ('beds', 'Wall Beds', 'category', 'beds', 'beds', '/products/beds', 1, true, true, ''),
  ('sofas', 'Sofas', 'category', 'sofas', 'sofas', '/products/sofas', 2, true, true, ''),
  ('cabinets', 'Cabinets', 'category', 'cabinets', 'cabinets', '/products/cabinets', 3, true, true, ''),
  ('mattresses', 'Mattresses', 'category', 'mattresses', 'mattresses', '/products/mattresses', 4, true, true, ''),
  ('tables', 'Smart Tables', 'category', 'tables', 'tables', '/products/tables', 5, false, true, ''),
  ('extras', 'Extras & Accessories', 'category', 'extras', 'extras', '/products/extras', 6, false, true, ''),
  ('support', 'Support & Guides', 'custom', NULL, 'support', '/support/faq', 7, false, true, '')
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
  updated_at = NOW();
