-- ============================================================
-- WALLBEDKING DATABASE SCHEMA: Categories & Tags (Címkék)
-- ============================================================

-- 1. Table: public.categories
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  slug TEXT,
  description TEXT,
  subcategories TEXT[] DEFAULT '{}',
  image TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for categories
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories (display_order);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access on categories" ON public.categories;
CREATE POLICY "Service role full access on categories" ON public.categories
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- 2. Table: public.tags
CREATE TABLE IF NOT EXISTS public.tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color VARCHAR(50) DEFAULT '#D4AF37',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for tags
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags (slug);

-- Enable RLS for tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view tags" ON public.tags;
CREATE POLICY "Public can view tags" ON public.tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access on tags" ON public.tags;
CREATE POLICY "Service role full access on tags" ON public.tags
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- 3. Extend products table with tags column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN (tags);


-- 4. Initial Seed Data: Categories
INSERT INTO public.categories (id, name, title, slug, description, subcategories, image, display_order)
VALUES
  (
    'beds',
    'Murphy Beds (Wall Beds)',
    'Murphy Beds (Wall Beds)',
    'beds',
    'Premium vertical and horizontal wall beds with gas piston counterbalancing mechanism and integrated slatted bed frame.',
    ARRAY['Classic Vertical', 'Classic Horizontal', 'Studio Vertical Desk Bed', 'Studio Horizontal Desk Bed', 'Integrated Front Bed'],
    '/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp',
    1
  ),
  (
    'sofas',
    'Sofas & Modular Fronts',
    'Sofas & Modular Fronts',
    'sofas',
    'Modular sofas, chaise lounges, and ottomans engineered specifically to fit seamlessly in front of WallBedKing murphy beds.',
    ARRAY['Modular 2-Seater Sofa', 'Modular 3-Seater Sofa', 'L-Shape Chaise Lounge Extension', 'Storage Ottoman Footstool'],
    '/product-images/morphy-integrated/160x200-4.jpg',
    2
  ),
  (
    'tables',
    'Smart & Transforming Tables',
    'Smart & Transforming Tables',
    'tables',
    'Multifunctional, height-adjustable, drop-leaf and extending tables engineered for compact living and seamless bed pairing.',
    ARRAY['Transforming Coffee-to-Dining Table', 'Wall-Mounted Drop-Leaf Folding Table', 'Extending Console-to-Dining Table', 'Compact Bed-Front Side Table'],
    '/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp',
    3
  ),
  (
    'mattresses',
    'Mattresses',
    'Mattresses',
    'mattresses',
    'Rigorously tested, max. 30 cm depth orthopaedic memory foam and pocket sprung mattresses crafted for vertical storage.',
    ARRAY['Orthopaedic Memory Foam', 'Pocket Spring Hybrid Comfort', 'Hypoallergenic Slim Mattress'],
    '/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp',
    4
  ),
  (
    'cabinets',
    'Cabinets & Bookcases',
    'Cabinets & Bookcases',
    'cabinets',
    'Matching modular wardrobes, shelving systems, and overhead bridge storage designed to complement wall bed finishes.',
    ARRAY['Single Wardrobe with Hanging Rail', 'Bookcase Shelf Unit with Soft-Close Doors', 'Overhead Bridge Storage'],
    '/product-images/morphy-integrated/160x200-6.jpg',
    5
  ),
  (
    'extras',
    'Extras & Accessories',
    'Extras & Accessories',
    'extras',
    'Integrated dual LED reading lights, recessed USB-C fast charging stations, headboards, and mattress retaining straps.',
    ARRAY['Integrated Dual LED Reading Lights', 'Recessed USB-C Fast Charger Ports', 'Upholstered Padded Headboard', 'Mattress Retaining Straps'],
    '/product-images/morphy-integrated/160x200-8.jpg',
    6
  )
ON CONFLICT (id) DO NOTHING;


-- 5. Initial Seed Data: Tags
INSERT INTO public.tags (id, name, slug, color, description)
VALUES
  ('best-seller', 'Best Seller', 'best-seller', '#D4AF37', 'Top-rated & most popular customer favorites'),
  ('new-arrival', 'New Arrival', 'new-arrival', '#3B82F6', 'Newly launched designs and latest mechanism upgrades'),
  ('sale', 'Special Offer', 'sale', '#EF4444', 'Discounted products and seasonal promotions'),
  ('space-saver', 'Space Saver', 'space-saver', '#10B981', 'Optimized for studio flats and compact micro-apartments'),
  ('premium', 'Premium Edition', 'premium', '#8B5CF6', 'High-end finishes and deluxe engineered materials'),
  ('quick-ship', 'Quick Ship', 'quick-ship', '#F59E0B', 'In stock with rapid delivery dispatch')
ON CONFLICT (id) DO NOTHING;
