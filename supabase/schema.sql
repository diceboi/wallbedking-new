-- ============================================================
-- WALLBEDKING DATABASE SCHEMA
-- Table: products
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
  id INT PRIMARY KEY,
  ean VARCHAR(50),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Dimensions & Technical Specs
  width INT,
  length INT,
  height INT,
  frame_width INT,
  folded_up_height INT,
  folded_up_projection INT,
  folded_down_projection INT,
  frame_distance_from_ground INT,
  mounting_frame_height INT,
  maximum_mattress_depth INT,
  
  -- Variants & Classification
  orientation VARCHAR(50),
  type VARCHAR(100),
  color VARCHAR(50),
  weight NUMERIC,
  stock INT DEFAULT 100,
  package_dimensions TEXT,
  
  -- Pricing & Sales
  price_gbp NUMERIC,
  price_euro NUMERIC,
  price_usd NUMERIC,
  sale_percent NUMERIC,
  sale_fix_gbp NUMERIC,
  sale_fix_euro NUMERIC,
  sale_fix_usd NUMERIC,
  sale_price_gbp NUMERIC,
  sale_price_euro NUMERIC,
  sale_price_usd NUMERIC,
  
  -- Taxonomy
  category TEXT,
  parent_category VARCHAR(50),
  sub_category VARCHAR(100),
  
  -- Status & Information
  backorder BOOLEAN DEFAULT TRUE,
  visibility VARCHAR(50) DEFAULT 'Visible',
  warranty TEXT,
  description TEXT,
  
  -- Media & SEO
  image TEXT,
  hover_image TEXT,
  product_images TEXT[] DEFAULT '{}',
  product_image_alt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  has_3d BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for rapid lookup & filtering
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_parent_category ON public.products (parent_category);
CREATE INDEX IF NOT EXISTS idx_products_orientation ON public.products (orientation);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products (type);
CREATE INDEX IF NOT EXISTS idx_products_visibility ON public.products (visibility);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to visible products
DROP POLICY IF EXISTS "Public can view visible products" ON public.products;
CREATE POLICY "Public can view visible products" ON public.products
  FOR SELECT
  USING (true);

-- Allow service role full write access
DROP POLICY IF EXISTS "Service role full access" ON public.products;
CREATE POLICY "Service role full access" ON public.products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
