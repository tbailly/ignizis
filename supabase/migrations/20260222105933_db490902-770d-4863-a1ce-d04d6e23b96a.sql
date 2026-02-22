
ALTER TABLE public.documents
  ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

CREATE POLICY "Members can view company documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (company_id IS NOT NULL AND is_member_of_company(company_id));
