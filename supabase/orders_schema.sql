-- ============================================================
-- WALLBEDKING DATABASE SCHEMA: ORDERS & ORDER ITEMS
-- ============================================================

-- 1. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,                       -- e.g. 'WBK-89241' or UUID
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Order & Payment Status
  status VARCHAR(50) DEFAULT 'pending',      -- 'pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'
  payment_status VARCHAR(50) DEFAULT 'unpaid',-- 'unpaid', 'paid', 'refunded', 'failed'
  payment_method VARCHAR(50) DEFAULT 'card', -- 'stripe', 'paypal', 'card', 'bank_transfer'
  payment_id TEXT,                           -- Stripe Session / PI ID or PayPal Txn ID
  
  -- Customer Details
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Addresses (JSONB structured)
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  
  -- Order Items & Breakdown
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  currency VARCHAR(10) DEFAULT 'GBP',
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  promo_code VARCHAR(50),
  shipping_amount NUMERIC(10, 2) DEFAULT 0.00,
  vat_amount NUMERIC(10, 2) DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  
  -- Delivery & Shipping Info
  delivery_option VARCHAR(100) DEFAULT 'delivery_option_economy',
  delivery_label TEXT,
  delivery_message TEXT,
  tracking_number TEXT,
  tracking_carrier TEXT,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Admin & Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indices for fast searches & dashboard querying
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders (payment_id);

-- 3. Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public / anon users to insert new orders on checkout
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view only their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    customer_email = auth.jwt()->>'email'
  );

-- Service role full access for server-side APIs and admin actions
DROP POLICY IF EXISTS "Service role has full access to orders" ON public.orders;
CREATE POLICY "Service role has full access to orders" ON public.orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
