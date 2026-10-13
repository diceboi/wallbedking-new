-- ============================================================
-- WALLBEDKING DATABASE MIGRATION: Category Images & Visibility
-- ============================================================
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run

-- 1. Ensure columns exist on public.categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS grid_image TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS href TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 2. Upsert the separated Morphy and Traditional categories and update existing ones with Supabase Storage URLs
INSERT INTO public.categories (id, name, title, slug, href, description, subcategories, image, grid_image, display_order, is_featured, is_visible)
VALUES
  (
    'morphy-beds',
    'MORPHY™ Beds',
    'MORPHY™ Beds',
    'beds?collection=morphy',
    '/products/beds?collection=morphy',
    'Next-generation MORPHY™ foldaway wall beds engineered with precision German gas pistons and integrated comfort.',
    ARRAY['Classic Vertical', 'Classic Horizontal', 'Studio Vertical', 'Studio Horizontal', 'Integrated Vertical', 'Integrated Horizontal'],
    'https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/morphy-beds.webp',
    'https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/morphy-beds.webp',
    1,
    true,
    true
  ),
  (
    'traditional-beds',
    'Traditional Beds',
    'Traditional Beds',
    'beds?collection=traditional',
    '/products/beds?collection=traditional',
    'Time-tested Traditional wall beds with proven mechanism and solid engineering.',
    ARRAY['Classic Vertical', 'Classic Horizontal', 'Studio Vertical', 'Studio Horizontal'],
    'https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/traditional-beds.webp',
    'https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/traditional-beds.webp',
    2,
    true,
    true
  ),
  (
    'cabinets',
    'Cabinets',
    'Cabinets',
    'cabinets',
    '/products/cabinets',
    'Matching modular wardrobes, shelving systems, and overhead bridge storage designed to complement wall bed finishes.',
    ARRAY['Vertical Enclosure', 'Horizontal Enclosure', 'Overhead Bridge', 'Side Storage Unit'],
    'https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/cabinets.webp',
    'https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/cabinets.webp',
    3,
    true,
    true
  ),
  (
    'mattresses',
    'Mattresses',
    'Mattresses',
    'mattresses',
    '/products/mattresses',
    'Rigorously tested orthopaedic memory foam and pocket sprung mattresses crafted for vertical storage.',
    ARRAY['Pocket Sprung Comfort', 'Orthopaedic Luxury', 'Hybrid Supreme'],
    'https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/mattresses.webp',
    'https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/mattresses.webp',
    4,
    true,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  href = EXCLUDED.href,
  description = EXCLUDED.description,
  subcategories = EXCLUDED.subcategories,
  image = EXCLUDED.image,
  grid_image = EXCLUDED.grid_image,
  display_order = EXCLUDED.display_order,
  is_featured = EXCLUDED.is_featured,
  is_visible = EXCLUDED.is_visible,
  updated_at = NOW();

-- 3. Update secondary categories display order and visibility
UPDATE public.categories SET display_order = 5, is_visible = false WHERE id = 'beds';
UPDATE public.categories SET display_order = 6, is_visible = false WHERE id = 'sofas';
UPDATE public.categories SET display_order = 7, is_visible = false WHERE id = 'tables';
UPDATE public.categories SET display_order = 8, is_visible = false WHERE id = 'extras';
