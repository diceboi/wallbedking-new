-- Checkout & Shipping Payment Settings Table
CREATE TABLE IF NOT EXISTS public.checkout_settings (
  locale TEXT PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.checkout_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for checkout storefronts)
CREATE POLICY "Allow public read checkout_settings" ON public.checkout_settings
  FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role all checkout_settings" ON public.checkout_settings
  FOR ALL USING (auth.role() = 'service_role');
