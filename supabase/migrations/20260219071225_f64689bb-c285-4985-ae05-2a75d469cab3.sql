CREATE TABLE public.officer_company_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id uuid NOT NULL REFERENCES public.company_officers(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (officer_id, company_id)
);

ALTER TABLE public.officer_company_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all assignments"
  ON public.officer_company_assignments FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Members can view company assignments"
  ON public.officer_company_assignments FOR SELECT
  USING (public.is_member_of_company(company_id));

CREATE POLICY "Admins can insert assignments"
  ON public.officer_company_assignments FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update assignments"
  ON public.officer_company_assignments FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete assignments"
  ON public.officer_company_assignments FOR DELETE
  USING (public.is_admin(auth.uid()));