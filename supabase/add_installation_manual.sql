-- ============================================================
-- SQL Migration: Add Installation Manual Column to Products
-- ============================================================
-- Stores the Supabase Storage URL / public link to the PDF manual for assembly and installation.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS installation_manual TEXT;

COMMENT ON COLUMN public.products.installation_manual IS 'Public Supabase storage URL to the assembly & installation manual PDF';
