-- =====================================================================
-- WALLBEDKING WHOLESALE / B2B SCHEMA MIGRATION
-- Run this SQL in Supabase SQL Editor to add native wholesale columns.
-- =====================================================================

-- 1. Products table: wholesale pricing & container capacity columns
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS wholesale_hk_usd NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS wholesale_uk_gbp NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS wholesale_eu_eur NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS wholesale_us_usd NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS container_qty INTEGER,
  ADD COLUMN IF NOT EXISTS wholesale_visible BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_products_wholesale_visible
  ON public.products (wholesale_visible);

-- 2. Profiles table: wholesale partner permissions & company info
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wholesale_tier TEXT,
  ADD COLUMN IF NOT EXISTS wholesale_market TEXT,
  ADD COLUMN IF NOT EXISTS wholesale_discount_override NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS vat_number TEXT;

-- Relax role check constraint if present to allow 'wholesale' alongside existing roles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_role_check' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('admin', 'customer', 'staff', 'wholesale'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_wholesale_tier
  ON public.profiles (wholesale_tier);

-- 3. Orders table: separate B2B / wholesale orders cleanly from retail orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'retail',
  ADD COLUMN IF NOT EXISTS wholesale_tier TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS vat_number TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_order_type
  ON public.orders (order_type);
