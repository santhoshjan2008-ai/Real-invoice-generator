-- ==============================================================================
-- 003_add_storage_columns.sql
-- Add columns for file storage URLs and bank details to public.invoices
-- ==============================================================================

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS signature_url TEXT,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS bank_details JSONB DEFAULT '{}'::jsonb;

-- Trigger to automatically update updated_at timestamp on edit for invoices
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_invoice_updated ON public.invoices;
CREATE TRIGGER on_invoice_updated
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

