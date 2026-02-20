
-- Drop the still-broken policy
DROP POLICY IF EXISTS "Members can view their company officers" ON public.company_officers;

-- Recreate it correctly: oca.officer_id must equal company_officers.id (outer table)
CREATE POLICY "Members can view their company officers"
  ON public.company_officers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.officer_company_assignments oca
      WHERE oca.officer_id = company_officers.id
        AND public.is_member_of_company(oca.company_id)
    )
  );
