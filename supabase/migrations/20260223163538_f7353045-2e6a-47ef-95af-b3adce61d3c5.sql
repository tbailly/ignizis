
CREATE POLICY "Members can view company requests"
  ON public.requests FOR SELECT
  USING (is_member_of_company(company_id));

CREATE POLICY "Members can insert company requests"
  ON public.requests FOR INSERT
  WITH CHECK (is_member_of_company(company_id));
