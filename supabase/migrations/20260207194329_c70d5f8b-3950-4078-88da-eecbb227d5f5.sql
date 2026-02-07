
-- 1. Add new informational columns
ALTER TABLE public.companies ADD COLUMN company_number TEXT UNIQUE;
ALTER TABLE public.companies ADD COLUMN address TEXT;
ALTER TABLE public.companies ADD COLUMN country TEXT;

-- 2. Add boolean permission columns
ALTER TABLE public.companies ADD COLUMN perm_legal BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.companies ADD COLUMN perm_accounting BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.companies ADD COLUMN perm_finance BOOLEAN NOT NULL DEFAULT true;

-- 3. Migrate existing JSONB data to new boolean columns
UPDATE public.companies
SET perm_legal = COALESCE((permissions->>'juridique')::boolean, true),
    perm_accounting = COALESCE((permissions->>'comptabilite')::boolean, true),
    perm_finance = COALESCE((permissions->>'finance')::boolean, true);

-- 4. Drop the JSONB permissions column
ALTER TABLE public.companies DROP COLUMN permissions;

-- 5. Drop the now-obsolete get_company_permissions function
DROP FUNCTION IF EXISTS public.get_company_permissions(uuid);

-- 6. Rewrite has_permission to use boolean columns directly
CREATE OR REPLACE FUNCTION public.has_permission(target_company_id UUID, section_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT CASE section_name
    WHEN 'legal' THEN COALESCE((SELECT perm_legal FROM public.companies WHERE id = target_company_id), false)
    WHEN 'accounting' THEN COALESCE((SELECT perm_accounting FROM public.companies WHERE id = target_company_id), false)
    WHEN 'finance' THEN COALESCE((SELECT perm_finance FROM public.companies WHERE id = target_company_id), false)
    WHEN 'entreprise' THEN true
    WHEN 'contrats' THEN true
    ELSE false
  END
  AND public.is_member_of_company(target_company_id);
$$;
