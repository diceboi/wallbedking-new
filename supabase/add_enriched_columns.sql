-- ============================================================
-- SQL Migration: Add Enriched Columns (SKU, Multi-Country EAN, Weights, Package Dimensions)
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ean_uk VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_us VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_de VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_fr VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_es VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_it VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ean_pt VARCHAR(50),
  ADD COLUMN IF NOT EXISTS pack_1 TEXT,
  ADD COLUMN IF NOT EXISTS pack_2 TEXT,
  ADD COLUMN IF NOT EXISTS pack_3 TEXT,
  ADD COLUMN IF NOT EXISTS pack_4 TEXT;

-- Indices for rapid lookup & filtering by SKU and barcode across markets
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products (sku);
CREATE INDEX IF NOT EXISTS idx_products_ean ON public.products (ean);
CREATE INDEX IF NOT EXISTS idx_products_ean_uk ON public.products (ean_uk);
CREATE INDEX IF NOT EXISTS idx_products_ean_de ON public.products (ean_de);
CREATE INDEX IF NOT EXISTS idx_products_ean_us ON public.products (ean_us);
CREATE INDEX IF NOT EXISTS idx_products_weight ON public.products (weight);
