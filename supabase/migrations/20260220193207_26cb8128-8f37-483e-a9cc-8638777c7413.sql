
CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'new',
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Trigger updated_at
CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select all requests"
  ON public.requests FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert requests"
  ON public.requests FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update requests"
  ON public.requests FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete requests"
  ON public.requests FOR DELETE
  USING (is_admin(auth.uid()));
