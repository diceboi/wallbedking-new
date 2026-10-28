-- ====================================================================
-- WALLBEDKING DATABASE MIGRATION: Add Unlisted / Direct-Link-Only Settings
-- ====================================================================
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run

-- 1. Add is_unlisted and visibility columns to public.categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_unlisted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'Visible';

-- 2. Add is_unlisted column to public.products (visibility already exists)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_unlisted BOOLEAN DEFAULT false;

-- 3. Create index for fast unlisted/visibility queries
CREATE INDEX IF NOT EXISTS idx_categories_is_unlisted ON public.categories (is_unlisted);
CREATE INDEX IF NOT EXISTS idx_products_is_unlisted ON public.products (is_unlisted);

-- 4. Set 'tables' category and products to Unlisted / Direct-Link-Only
UPDATE public.categories
SET
  is_visible = true,
  is_unlisted = true,
  visibility = 'Unlisted'
WHERE id = 'tables' OR slug = 'tables';

UPDATE public.products
SET
  is_unlisted = true,
  visibility = 'Unlisted'
WHERE parent_category = 'tables';

-- 5. Ensure tables navigation menu item is hidden from main navbar
UPDATE public.navigation_menu
SET is_visible = false
WHERE id = 'tables' OR category_id = 'tables' OR slug = 'tables';
