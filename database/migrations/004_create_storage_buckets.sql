-- ==============================================================================
-- 004_create_storage_buckets.sql
-- Create Supabase Storage buckets for logos and PDFs with RLS policies
-- ==============================================================================

-- 1. Create company-logos bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  2097152, -- 2 MB
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']::text[];

-- 2. Create invoice-pdfs bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoice-pdfs',
  'invoice-pdfs',
  true,
  10485760, -- 10 MB
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- 3. Storage policies for company-logos
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
CREATE POLICY "Public can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated users can update own logos" ON storage.objects;
CREATE POLICY "Authenticated users can update own logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated users can delete own logos" ON storage.objects;
CREATE POLICY "Authenticated users can delete own logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'company-logos');

-- 4. Storage policies for invoice-pdfs
DROP POLICY IF EXISTS "Public can view PDFs" ON storage.objects;
CREATE POLICY "Public can view PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invoice-pdfs');

DROP POLICY IF EXISTS "Authenticated users can upload PDFs" ON storage.objects;
CREATE POLICY "Authenticated users can upload PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'invoice-pdfs');

DROP POLICY IF EXISTS "Authenticated users can update own PDFs" ON storage.objects;
CREATE POLICY "Authenticated users can update own PDFs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'invoice-pdfs');

DROP POLICY IF EXISTS "Authenticated users can delete own PDFs" ON storage.objects;
CREATE POLICY "Authenticated users can delete own PDFs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'invoice-pdfs');

