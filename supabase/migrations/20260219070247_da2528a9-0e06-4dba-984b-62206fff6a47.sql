
-- Drop the RLS policy that depends on company_id
DROP POLICY IF EXISTS "Members can view company officers" ON public.company_officers;

-- Now drop the company_id column (cascades the FK constraint)
ALTER TABLE public.company_officers DROP COLUMN company_id;
