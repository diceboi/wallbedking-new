-- Migration: Add installation_video column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS installation_video TEXT;
