-- ==============================================================================
-- 006_create_business_profiles.sql
-- Multi-Business Profile & Management System
-- Creates:
--   1. public.business_profiles table
--   2. public.user_business_preferences table
--   3. Adds business_id foreign key to public.invoices
--   4. Configures Row Level Security (RLS) policies
-- ==============================================================================

-- 1. Create the business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  business_description TEXT,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  tax_type TEXT,
  tax_number TEXT,
  default_tax_rate NUMERIC DEFAULT 0,
  account_holder_name TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  swift_code TEXT,
  upi_id TEXT,
  payment_instructions TEXT,
  default_currency TEXT DEFAULT 'USD',
  default_payment_terms TEXT,
  default_invoice_notes TEXT,
  default_invoice_footer TEXT,
  default_due_period INTEGER DEFAULT 30,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON public.business_profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_profiles
DROP POLICY IF EXISTS "Users can view own business profiles" ON public.business_profiles;
CREATE POLICY "Users can view own business profiles"
  ON public.business_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own business profiles" ON public.business_profiles;
CREATE POLICY "Users can insert own business profiles"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own business profiles" ON public.business_profiles;
CREATE POLICY "Users can update own business profiles"
  ON public.business_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own business profiles" ON public.business_profiles;
CREATE POLICY "Users can delete own business profiles"
  ON public.business_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS on_business_profile_updated ON public.business_profiles;
CREATE TRIGGER on_business_profile_updated
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Create the user_business_preferences table for storing active business selection
CREATE TABLE IF NOT EXISTS public.user_business_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_business_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.user_business_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own business preferences" ON public.user_business_preferences;
CREATE POLICY "Users can view own business preferences"
  ON public.user_business_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own business preferences" ON public.user_business_preferences;
CREATE POLICY "Users can insert own business preferences"
  ON public.user_business_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own business preferences" ON public.user_business_preferences;
CREATE POLICY "Users can update own business preferences"
  ON public.user_business_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own business preferences" ON public.user_business_preferences;
CREATE POLICY "Users can delete own business preferences"
  ON public.user_business_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Update public.invoices to link to business_profiles
-- Notice: ON DELETE SET NULL ensures deleting a business profile never cascades to delete invoices!
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_business_id ON public.invoices(business_id);
