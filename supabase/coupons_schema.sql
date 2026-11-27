-- Optional native SQL tables for WallBedKing Coupons & Influencer Affiliates.
-- Note: The application works immediately via Supabase checkout_settings persistence,
-- and this schema can be run in Supabase SQL Editor for dedicated SQL reporting columns.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS affiliate_code text,
  ADD COLUMN IF NOT EXISTS influencer_commission numeric(10, 2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_promo_code ON public.orders (promo_code);
CREATE INDEX IF NOT EXISTS idx_orders_affiliate_code ON public.orders (affiliate_code);

CREATE TABLE IF NOT EXISTS public.coupons (
  id text PRIMARY KEY,
  code text UNIQUE NOT NULL,
  active boolean NOT NULL DEFAULT true,
  description text DEFAULT '',
  discount_type text NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value numeric(10, 2) NOT NULL DEFAULT 0,
  fixed_amounts jsonb DEFAULT '{}'::jsonb,
  allow_stack_with_promotions boolean NOT NULL DEFAULT false,
  allow_stack_with_delivery_discount boolean NOT NULL DEFAULT false,
  target_markets jsonb DEFAULT '[]'::jsonb,
  target_categories jsonb DEFAULT '[]'::jsonb,
  excluded_categories jsonb DEFAULT '[]'::jsonb,
  min_order_amount numeric(10, 2) DEFAULT 0,
  max_uses integer DEFAULT NULL,
  one_per_customer boolean NOT NULL DEFAULT false,
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL,
  is_influencer boolean NOT NULL DEFAULT false,
  influencer_name text DEFAULT '',
  influencer_handle text DEFAULT '',
  influencer_email text DEFAULT '',
  influencer_avatar text DEFAULT '',
  influencer_message text DEFAULT '',
  commission_percent numeric(5, 2) DEFAULT 0,
  auto_apply_on_ref boolean NOT NULL DEFAULT true,
  cookie_days integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
