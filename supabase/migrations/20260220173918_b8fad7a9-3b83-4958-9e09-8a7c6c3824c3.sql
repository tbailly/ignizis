
-- Fix the broken RLS policy on company_officers for members
-- The condition was: oca.officer_id = oca.id (comparing two columns of the same junction table - always false)
-- The correct condition is: oca.officer_id = id (where id refers to company_officers.id)

DROP POLICY IF EXISTS "Members can view their company officers" ON public.company_officers;

CREATE POLICY "Members can view their company officers"
  ON public.company_officers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.officer_company_assignments oca
      WHERE oca.officer_id = id
        AND public.is_member_of_company(oca.company_id)
    )
  );
