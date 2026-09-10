-- ==========================================================
-- WALLBEDKING MARKETPLACE FEEDS SCHEMA
-- Table: marketplace_feed_items
-- Supports: Amazon (FR, DE, UK, IT, ES), OTTO, Mirakl, etc.
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.marketplace_feed_items (
  id TEXT PRIMARY KEY,
  feed_id TEXT NOT NULL,                  -- e.g. 'amazon-fr-classic', 'otto-de', 'mirakl-fr'
  item_sku TEXT NOT NULL,
  external_product_id TEXT,               -- EAN / UPC / ISBN
  external_product_id_type TEXT DEFAULT 'EAN',
  item_name TEXT NOT NULL,
  brand_name TEXT DEFAULT 'WallBedKing',
  product_description TEXT,
  bullet_point1 TEXT,
  bullet_point2 TEXT,
  bullet_point3 TEXT,
  bullet_point4 TEXT,
  bullet_point5 TEXT,
  generic_keywords TEXT,
  main_image_url TEXT,
  other_image_url1 TEXT,
  other_image_url2 TEXT,
  other_image_url3 TEXT,
  other_image_url4 TEXT,
  other_image_url5 TEXT,
  recommended_browse_nodes TEXT,
  parent_child TEXT DEFAULT 'child',      -- 'parent' | 'child'
  parent_sku TEXT,
  relationship_type TEXT,                 -- 'Variation'
  variation_theme TEXT DEFAULT 'size',
  size_name TEXT,
  standard_price NUMERIC(10, 2),
  currency TEXT DEFAULT 'EUR',
  quantity INTEGER DEFAULT 10,
  fulfillment_channel TEXT DEFAULT 'MFN',
  care_instructions TEXT,
  furniture_finish TEXT DEFAULT 'Alloy Steel',
  finish_type TEXT DEFAULT 'Powder Coated',
  product_type TEXT DEFAULT 'bed_frame',
  condition_type TEXT DEFAULT 'New',
  update_delete TEXT DEFAULT 'Update',
  warranty_description TEXT DEFAULT 'Garantie à vie',
  safety_warning TEXT,
  country_of_origin TEXT DEFAULT 'Allemagne',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for rapid querying and uniqueness per feed
CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_item_sku ON public.marketplace_feed_items (feed_id, item_sku);
CREATE INDEX IF NOT EXISTS idx_feed_id ON public.marketplace_feed_items (feed_id);
CREATE INDEX IF NOT EXISTS idx_feed_parent_sku ON public.marketplace_feed_items (parent_sku);
CREATE INDEX IF NOT EXISTS idx_feed_external_id ON public.marketplace_feed_items (external_product_id);

-- Enable RLS
ALTER TABLE public.marketplace_feed_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to feeds (for live feed generators / aggregators)
CREATE POLICY "Public read access for marketplace feeds"
  ON public.marketplace_feed_items
  FOR SELECT
  USING (true);

-- Allow service_role full control
CREATE POLICY "Full access for service_role on marketplace feeds"
  ON public.marketplace_feed_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
