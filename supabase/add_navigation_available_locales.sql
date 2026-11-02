-- ====================================================================
-- WALLBEDKING DATABASE MIGRATION: Regional Visibility for Navigation Menu
-- ====================================================================
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run

-- 1. Add available_locales column to public.navigation_menu
-- Supported markets: en (UK), us (US), de (DE), fr (FR), es (ES), por (POR), it (IT)
ALTER TABLE public.navigation_menu
  ADD COLUMN IF NOT EXISTS available_locales TEXT[] DEFAULT '{en,us,de,fr,es,por,it}';

-- 2. Create GIN index for fast regional filtering
CREATE INDEX IF NOT EXISTS idx_navigation_menu_available_locales
  ON public.navigation_menu USING GIN (available_locales);

-- 3. Populate current regional visibility per menu item based on active storefront state
-- MORPHY™ Beds: visible in all 7 markets (UK, US, DE, FR, ES, POR, IT)
UPDATE public.navigation_menu
SET available_locales = ARRAY['en', 'us', 'de', 'fr', 'es', 'por', 'it']::TEXT[],
    updated_at = NOW()
WHERE id = 'morphyBeds' OR slug = 'morphy-beds';

-- Clearance (Traditional Beds): visible in UK & EU markets (not US)
UPDATE public.navigation_menu
SET available_locales = ARRAY['en', 'de', 'fr', 'es', 'por', 'it']::TEXT[],
    updated_at = NOW()
WHERE id = 'traditionalBeds' OR slug = 'traditional-beds';

-- Cabinets: visible in UK & EU markets (not US)
UPDATE public.navigation_menu
SET available_locales = ARRAY['en', 'de', 'fr', 'es', 'por', 'it']::TEXT[],
    updated_at = NOW()
WHERE id = 'cabinets' OR slug = 'cabinets';

-- Mattresses: visible in UK & EU markets (not US)
UPDATE public.navigation_menu
SET available_locales = ARRAY['en', 'de', 'fr', 'es', 'por', 'it']::TEXT[],
    updated_at = NOW()
WHERE id = 'mattresses' OR slug = 'mattresses';

-- Smart Tables: currently displayed across all 7 markets in header
UPDATE public.navigation_menu
SET available_locales = ARRAY['en', 'us', 'de', 'fr', 'es', 'por', 'it']::TEXT[],
    updated_at = NOW()
WHERE id = 'tables' OR slug = 'tables';

-- Remaining items (Sofas, Extras, Wall Beds, Support & any custom items): default all 7 markets
UPDATE public.navigation_menu
SET available_locales = ARRAY['en', 'us', 'de', 'fr', 'es', 'por', 'it']::TEXT[],
    updated_at = NOW()
WHERE id IN ('sofas', 'extras', 'beds', 'support')
   OR available_locales IS NULL;

