-- ====================================================================
-- SQL Migration: Add Short Descriptions (Briefs) for Products
-- ====================================================================
-- Adds dedicated short_description columns for buy box / under price summary:
-- Locales: en (UK), us (US), de (Germany), fr (France), es (Spain), por/pt (Portugal), it (Italy)
--
-- Run this script in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard).

ALTER TABLE public.products
  -- Short description / brief overview per market (displayed under price on product page)
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS short_description_en TEXT,
  ADD COLUMN IF NOT EXISTS short_description_us TEXT,
  ADD COLUMN IF NOT EXISTS short_description_de TEXT,
  ADD COLUMN IF NOT EXISTS short_description_fr TEXT,
  ADD COLUMN IF NOT EXISTS short_description_es TEXT,
  ADD COLUMN IF NOT EXISTS short_description_por TEXT,
  ADD COLUMN IF NOT EXISTS short_description_pt TEXT,
  ADD COLUMN IF NOT EXISTS short_description_it TEXT;
