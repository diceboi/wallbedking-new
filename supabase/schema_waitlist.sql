-- ============================================================
-- WALLBEDKING DATABASE SCHEMA: product_waitlist
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  product_id INT,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  variant_name TEXT,
  options JSONB DEFAULT '{}'::jsonb,
  locale TEXT DEFAULT 'en',
  status TEXT DEFAULT 'waiting', -- 'waiting' | 'notified' | 'cancelled'
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for rapid queries
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON public.product_waitlist (user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_customer_email ON public.product_waitlist (customer_email);
CREATE INDEX IF NOT EXISTS idx_waitlist_product_id ON public.product_waitlist (product_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.product_waitlist (status);

-- Enable RLS
ALTER TABLE public.product_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (guests and users can join waitlist)
DROP POLICY IF EXISTS "Public can join waitlist" ON public.product_waitlist;
CREATE POLICY "Public can join waitlist" ON public.product_waitlist
  FOR INSERT
  WITH CHECK (true);

-- Allow users to view their own waitlist entries
DROP POLICY IF EXISTS "Users can view own waitlist" ON public.product_waitlist;
CREATE POLICY "Users can view own waitlist" ON public.product_waitlist
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    (auth.role() = 'service_role')
  );

-- Allow users to delete their own waitlist entries
DROP POLICY IF EXISTS "Users can delete own waitlist" ON public.product_waitlist;
CREATE POLICY "Users can delete own waitlist" ON public.product_waitlist
  FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    (auth.role() = 'service_role')
  );

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on waitlist" ON public.product_waitlist;
CREATE POLICY "Service role full access on waitlist" ON public.product_waitlist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
