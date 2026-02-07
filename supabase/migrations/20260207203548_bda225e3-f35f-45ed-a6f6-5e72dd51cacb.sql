
-- Create company_officers table
CREATE TABLE public.company_officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  date_of_birth DATE,
  position TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_officers ENABLE ROW LEVEL SECURITY;

-- Admin policies: full access
CREATE POLICY "Admins can view all officers"
  ON public.company_officers FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert officers"
  ON public.company_officers FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update officers"
  ON public.company_officers FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete officers"
  ON public.company_officers FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Members: read-only access for their company's officers
CREATE POLICY "Members can view company officers"
  ON public.company_officers FOR SELECT
  USING (public.is_member_of_company(company_id));
