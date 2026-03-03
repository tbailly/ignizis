
-- Create legal_pages table
CREATE TABLE public.legal_pages (
  id text PRIMARY KEY,
  content_html text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read
CREATE POLICY "Authenticated users can read legal pages"
  ON public.legal_pages FOR SELECT
  TO authenticated
  USING (true);

-- Admins can update
CREATE POLICY "Admins can update legal pages"
  ON public.legal_pages FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Admins can insert (for upsert)
CREATE POLICY "Admins can insert legal pages"
  ON public.legal_pages FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_legal_pages_updated_at
  BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the 3 rows
INSERT INTO public.legal_pages (id, content_html) VALUES
  ('legal-notice', ''),
  ('privacy', ''),
  ('terms', '');
