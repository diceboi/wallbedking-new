-- ============================================================
-- SQL Migration: Add available_locales column for country visibility
-- ============================================================

-- Add available_locales text array column to products table
-- Default is all 7 supported markets: en (UK), us (US), de (DE), fr (FR), es (ES), por (POR), it (IT)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS available_locales TEXT[] DEFAULT '{en,us,de,fr,es,por,it}';

-- Create GIN index for rapid query & filter by locale
CREATE INDEX IF NOT EXISTS idx_products_available_locales 
  ON public.products USING GIN (available_locales);
