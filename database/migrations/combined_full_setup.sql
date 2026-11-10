-- ==============================================================================
-- combined_full_setup.sql
-- Run this single script in Supabase Dashboard -> SQL Editor
-- Sets up:
--   1. public.profiles table + triggers + RLS
--   2. public.invoices table + storage columns + RLS
--   3. storage.buckets ('company-logos', 'invoice-pdfs') + storage policies
-- ==============================================================================

-- ==========================================
-- 1. PROFILES TABLE & AUTH TRIGGERS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to auto-create profile from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 2. INVOICES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  business_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_total NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  grand_total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  payment_terms TEXT,
  logo_url TEXT,
  signature_url TEXT,
  pdf_url TEXT,
  bank_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
CREATE POLICY "Users can insert own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
CREATE POLICY "Users can update own invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;
CREATE POLICY "Users can delete own invoices"
  ON public.invoices FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_invoice_updated ON public.invoices;
CREATE TRIGGER on_invoice_updated
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 3. STORAGE BUCKETS & POLICIES
-- ==========================================
-- 1. Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-pdfs', 'invoice-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for company-logos (View & Upload)
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
CREATE POLICY "Public can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Allow uploads to company-logos" ON storage.objects;
CREATE POLICY "Allow uploads to company-logos"
  ON storage.objects FOR INSERT
  TO authenticated, anon
  WITH CHECK (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Allow updates to company-logos" ON storage.objects;
CREATE POLICY "Allow updates to company-logos"
  ON storage.objects FOR UPDATE
  TO authenticated, anon
  USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Allow deletes to company-logos" ON storage.objects;
CREATE POLICY "Allow deletes to company-logos"
  ON storage.objects FOR DELETE
  TO authenticated, anon
  USING (bucket_id = 'company-logos');

-- 3. Storage Policies for invoice-pdfs (View & Upload)
DROP POLICY IF EXISTS "Public can view PDFs" ON storage.objects;
CREATE POLICY "Public can view PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invoice-pdfs');

DROP POLICY IF EXISTS "Allow uploads to invoice-pdfs" ON storage.objects;
CREATE POLICY "Allow uploads to invoice-pdfs"
  ON storage.objects FOR INSERT
  TO authenticated, anon
  WITH CHECK (bucket_id = 'invoice-pdfs');

DROP POLICY IF EXISTS "Allow updates to invoice-pdfs" ON storage.objects;
CREATE POLICY "Allow updates to invoice-pdfs"
  ON storage.objects FOR UPDATE
  TO authenticated, anon
  USING (bucket_id = 'invoice-pdfs');

DROP POLICY IF EXISTS "Allow deletes to invoice-pdfs" ON storage.objects;
CREATE POLICY "Allow deletes to invoice-pdfs"
  ON storage.objects FOR DELETE
  TO authenticated, anon
  USING (bucket_id = 'invoice-pdfs');

