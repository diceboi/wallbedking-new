-- ============================================================
-- SQL Migration: Add Localized Product Names and GTIN Columns
-- ============================================================
-- Adds dedicated columns for every supported market:
-- Locales: en (UK), us (US), de (Germany), fr (France), es (Spain), por/pt (Portugal), it (Italy)

ALTER TABLE public.products
  -- Localized Names per market
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_us TEXT,
  ADD COLUMN IF NOT EXISTS name_de TEXT,
  ADD COLUMN IF NOT EXISTS name_fr TEXT,
  ADD COLUMN IF NOT EXISTS name_es TEXT,
  ADD COLUMN IF NOT EXISTS name_por TEXT,
  ADD COLUMN IF NOT EXISTS name_pt TEXT,
  ADD COLUMN IF NOT EXISTS name_it TEXT,
  -- Localized GTINs (Global Trade Item Numbers / EAN / UPC) per market
  ADD COLUMN IF NOT EXISTS gtin_en VARCHAR(50),
  ADD COLUMN IF NOT EXISTS gtin_us VARCHAR(50),
  ADD COLUMN IF NOT EXISTS gtin_de VARCHAR(50),
  ADD COLUMN IF NOT EXISTS gtin_fr VARCHAR(50),
  ADD COLUMN IF NOT EXISTS gtin_es VARCHAR(50),
  ADD COLUMN IF NOT EXISTS gtin_por VARCHAR(50),
  ADD COLUMN IF NOT EXISTS gtin_pt VARCHAR(50),
  ADD COLUMN IF NOT EXISTS gtin_it VARCHAR(50);

-- Initialize / Seed localized names with base product name where currently NULL
UPDATE public.products
SET 
  name_en = COALESCE(name_en, name),
  name_us = COALESCE(name_us, name),
  name_de = COALESCE(name_de, name),
  name_fr = COALESCE(name_fr, name),
  name_es = COALESCE(name_es, name),
  name_por = COALESCE(name_por, name_pt, name),
  name_pt = COALESCE(name_pt, name_por, name),
  name_it = COALESCE(name_it, name)
WHERE name IS NOT NULL;

-- Initialize / Seed GTINs from existing EAN or regional EAN columns if available
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'ean_uk'
  ) THEN
    UPDATE public.products
    SET
      gtin_en = COALESCE(gtin_en, ean_uk, ean),
      gtin_us = COALESCE(gtin_us, ean_us, ean),
      gtin_de = COALESCE(gtin_de, ean_de, ean),
      gtin_fr = COALESCE(gtin_fr, ean_fr, ean),
      gtin_es = COALESCE(gtin_es, ean_es, ean),
      gtin_por = COALESCE(gtin_por, ean_pt, ean),
      gtin_pt = COALESCE(gtin_pt, gtin_por, ean_pt, ean),
      gtin_it = COALESCE(gtin_it, ean_it, ean);
  ELSE
    UPDATE public.products
    SET
      gtin_en = COALESCE(gtin_en, ean),
      gtin_us = COALESCE(gtin_us, ean),
      gtin_de = COALESCE(gtin_de, ean),
      gtin_fr = COALESCE(gtin_fr, ean),
      gtin_es = COALESCE(gtin_es, ean),
      gtin_por = COALESCE(gtin_por, ean),
      gtin_pt = COALESCE(gtin_pt, ean),
      gtin_it = COALESCE(gtin_it, ean);
  END IF;
END $$;

-- Create B-Tree indices for rapid search, ordering, and barcode lookup
CREATE INDEX IF NOT EXISTS idx_products_gtin_en ON public.products (gtin_en);
CREATE INDEX IF NOT EXISTS idx_products_gtin_us ON public.products (gtin_us);
CREATE INDEX IF NOT EXISTS idx_products_gtin_de ON public.products (gtin_de);
CREATE INDEX IF NOT EXISTS idx_products_gtin_fr ON public.products (gtin_fr);
CREATE INDEX IF NOT EXISTS idx_products_gtin_es ON public.products (gtin_es);
CREATE INDEX IF NOT EXISTS idx_products_gtin_por ON public.products (gtin_por);
CREATE INDEX IF NOT EXISTS idx_products_gtin_it ON public.products (gtin_it);
