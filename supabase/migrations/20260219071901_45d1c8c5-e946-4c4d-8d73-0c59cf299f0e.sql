-- Allow members to view officers assigned to their companies
CREATE POLICY "Members can view their company officers"
  ON public.company_officers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.officer_company_assignments oca
      WHERE oca.officer_id = id
        AND public.is_member_of_company(oca.company_id)
    )
  );