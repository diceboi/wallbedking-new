-- ============================================================
-- WALLBEDKING DATABASE SCHEMA: BUNDLES & BUNDLE ITEMS
-- ============================================================
-- Execute this script in the Supabase SQL Editor to enable
-- multi-product bundles with live component pricing, stock tracking,
-- and discount management.

-- 1. Bundles Table
CREATE TABLE IF NOT EXISTS public.bundles (
  id BIGSERIAL PRIMARY KEY,
  sku VARCHAR(100),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  
  -- Localized Names
  name_en TEXT,
  name_us TEXT,
  name_de TEXT,
  name_fr TEXT,
  name_es TEXT,
  name_por TEXT,
  name_it TEXT,
  
  -- Descriptions
  description TEXT,
  description_en TEXT,
  description_us TEXT,
  description_de TEXT,
  description_fr TEXT,
  description_es TEXT,
  description_por TEXT,
  description_it TEXT,
  
  extended_description TEXT,
  extended_description_en TEXT,
  extended_description_us TEXT,
  extended_description_de TEXT,
  extended_description_fr TEXT,
  extended_description_es TEXT,
  extended_description_por TEXT,
  extended_description_it TEXT,
  
  -- Taxonomy & Classification
  category TEXT DEFAULT 'bundles',
  parent_category VARCHAR(50) DEFAULT 'bundles',
  sub_category VARCHAR(100) DEFAULT 'Bed & Cabinet Sets',
  badge VARCHAR(100) DEFAULT 'Bundle & Save',
  tagline TEXT,
  
  -- Media
  image TEXT,
  hover_image TEXT,
  product_images TEXT[] DEFAULT '{}',
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status & Settings
  warranty TEXT DEFAULT '5-year manufacturer warranty',
  visibility VARCHAR(50) DEFAULT 'Visible',
  is_visible BOOLEAN DEFAULT TRUE,
  available_locales TEXT[] DEFAULT '{"en","us","de","fr","es","por","it"}',
  tags TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '[]',
  
  -- Discount Configuration
  discount_type VARCHAR(20) DEFAULT 'percent', -- 'percent' | 'fixed'
  discount_percent NUMERIC DEFAULT 10,         -- e.g. 10 for 10% discount
  discount_fix_gbp NUMERIC DEFAULT 0,
  discount_fix_euro NUMERIC DEFAULT 0,
  discount_fix_usd NUMERIC DEFAULT 0,
  
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bundle Components / Items Table
CREATE TABLE IF NOT EXISTS public.bundle_items (
  id BIGSERIAL PRIMARY KEY,
  bundle_id BIGINT NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  is_required BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for high performance
CREATE INDEX IF NOT EXISTS idx_bundles_slug ON public.bundles(slug);
CREATE INDEX IF NOT EXISTS idx_bundles_visibility ON public.bundles(visibility);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON public.bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product_id ON public.bundle_items(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Public can view bundles" ON public.bundles;
CREATE POLICY "Public can view bundles" ON public.bundles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access bundles" ON public.bundles;
CREATE POLICY "Service role full access bundles" ON public.bundles FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view bundle_items" ON public.bundle_items;
CREATE POLICY "Public can view bundle_items" ON public.bundle_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access bundle_items" ON public.bundle_items;
CREATE POLICY "Service role full access bundle_items" ON public.bundle_items FOR ALL TO service_role USING (true) WITH CHECK (true);
