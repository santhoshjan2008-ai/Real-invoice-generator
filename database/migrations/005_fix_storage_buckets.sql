-- ==============================================================================
-- 005_fix_storage_buckets.sql
-- Run this in Supabase Dashboard -> SQL Editor to create the required buckets
-- and set up open upload and view permissions.
-- ==============================================================================

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

