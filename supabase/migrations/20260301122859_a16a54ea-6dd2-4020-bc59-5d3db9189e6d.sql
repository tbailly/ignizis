
-- Add finance_software_url to companies
ALTER TABLE public.companies ADD COLUMN finance_software_url text DEFAULT NULL;

-- Recreate view with correct column order + new column
DROP VIEW IF EXISTS public.active_companies;
CREATE VIEW public.active_companies AS
SELECT id, name, slug, status, company_number, address, country, perm_legal, perm_accounting, perm_finance, accounting_software_url, finance_software_url, compliant_until, created_at, updated_at, deleted_at
FROM public.companies
WHERE deleted_at IS NULL;
