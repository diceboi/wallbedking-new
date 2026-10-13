-- ====================================================================
-- WALLBEDKING DATABASE MIGRATION: Migrate products to separate Morphy and Traditional categories
-- ====================================================================
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run

-- 1. Migrate MORPHY™ bed products to 'morphy-beds'
UPDATE public.products
SET parent_category = 'morphy-beds'
WHERE parent_category = 'beds'
  AND (category ILIKE '%MORPHY%' OR name ILIKE '%MORPHY%');

-- 2. Migrate Traditional bed products to 'traditional-beds'
UPDATE public.products
SET parent_category = 'traditional-beds'
WHERE parent_category = 'beds'
  AND (category ILIKE '%Base Beds%' OR NOT (name ILIKE '%MORPHY%'));
