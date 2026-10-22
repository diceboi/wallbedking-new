-- ============================================================
-- PRODUCT REVIEWS SCHEMA FOR WALL BED KING
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id TEXT PRIMARY KEY,
  product_slug TEXT NOT NULL,
  product_name TEXT,
  author_name TEXT NOT NULL,
  author_email TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  photos JSONB DEFAULT '[]'::jsonb,
  order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_buyer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for rapid querying & moderation
CREATE INDEX IF NOT EXISTS idx_product_reviews_slug_status 
  ON public.product_reviews (product_slug, status);

CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at 
  ON public.product_reviews (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_reviews_status 
  ON public.product_reviews (status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can read approved reviews
CREATE POLICY "Allow public read on approved reviews"
  ON public.product_reviews
  FOR SELECT
  USING (status = 'approved');

-- 2. Anyone can submit a review (starts as pending)
CREATE POLICY "Allow public insert for new reviews"
  ON public.product_reviews
  FOR INSERT
  WITH CHECK (true);

-- 3. Service role has full access (admin moderation)
CREATE POLICY "Allow service_role full management"
  ON public.product_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed initial genuine customer reviews
INSERT INTO public.product_reviews (
  id, product_slug, product_name, author_name, author_email, rating, title, content, photos, status, verified_buyer, created_at
) VALUES
(
  'rev-seed-1',
  'classic-vertical-wall-bed',
  'Classic Vertical Wall Bed',
  'Iain Donald',
  'iain.donald@example.com',
  5,
  'Outstanding quality and build',
  'Outstanding quality wall bed and excellent customer service. Straightforward installation instructions. Highly recommended if you want to save space and keep a high quality everyday mattress.',
  '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80"]'::jsonb,
  'approved',
  true,
  '2026-08-15T10:30:00.000Z'
),
(
  'rev-seed-2',
  'classic-vertical-wall-bed',
  'Classic Vertical Wall Bed',
  'Roz M.',
  'roz.m@example.com',
  5,
  'Perfect fit for our spare room',
  'The bed we bought is fantastic, we have a small room and it fits away perfectly. You can use your own mattress. We are really pleased with this product and would definitely recommend Wall Bed King.',
  '["https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=800&auto=format&fit=crop&q=80"]'::jsonb,
  'approved',
  true,
  '2026-08-28T14:15:00.000Z'
),
(
  'rev-seed-3',
  'studio-vertical-wall-bed',
  'Studio Vertical Wall Bed',
  'Christopher Pettite',
  'cpettite@example.com',
  5,
  'Best company I have dealt with',
  'I bought a bed from Wall Bed King, I have to say they have been one of the best companies I have dealt with in a long time. Prompt and helpful response to all my inquiries, and the gas struts feel silky smooth.',
  '[]'::jsonb,
  'approved',
  true,
  '2026-09-02T09:45:00.000Z'
),
(
  'rev-seed-4',
  'classic-horizontal-wall-bed',
  'Classic Horizontal Wall Bed',
  'Catherine O''Connor',
  'catherine.oc@example.com',
  5,
  'Great for low ceiling clearance',
  'I paid a great price for a small double bed, which made our attic room much better and useful. Could not be happier and more pleased with my purchase!',
  '["https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&auto=format&fit=crop&q=80"]'::jsonb,
  'approved',
  true,
  '2026-09-10T16:20:00.000Z'
)
ON CONFLICT (id) DO NOTHING;
