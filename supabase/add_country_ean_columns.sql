-- ============================================================
-- SQL Migration: Add Country-Specific EAN Columns to products
-- Target Market Codes: UK (en), US, DE, FR, ES, IT, PT (por)
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS ean_uk VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_us VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_de VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_fr VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_es VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_it VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_pt VARCHAR(50);

-- Migrate existing default EAN to ean_uk if null
UPDATE public.products
SET ean_uk = ean
WHERE ean_uk IS NULL AND ean IS NOT NULL;

-- Indices for fast barcode / EAN searches across markets
CREATE INDEX IF NOT EXISTS idx_products_ean_uk ON public.products (ean_uk);
CREATE INDEX IF NOT EXISTS idx_products_ean_us ON public.products (ean_us);
CREATE INDEX IF NOT EXISTS idx_products_ean_de ON public.products (ean_de);
CREATE INDEX IF NOT EXISTS idx_products_ean_fr ON public.products (ean_fr);
CREATE INDEX IF NOT EXISTS idx_products_ean_es ON public.products (ean_es);
CREATE INDEX IF NOT EXISTS idx_products_ean_it ON public.products (ean_it);
CREATE INDEX IF NOT EXISTS idx_products_ean_pt ON public.products (ean_pt);
