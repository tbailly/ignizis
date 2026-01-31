-- Supprimer TOUTES les policies dépendantes d'abord
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Owners can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Owners can delete their companies" ON public.companies;
DROP POLICY IF EXISTS "Company owners can invite users" ON public.user_companies;
DROP POLICY IF EXISTS "Company owners can remove users" ON public.user_companies;

-- Supprimer l'index obsolete
DROP INDEX IF EXISTS idx_companies_owner_id;

-- Ajouter permissions a companies
ALTER TABLE public.companies 
ADD COLUMN permissions JSONB NOT NULL DEFAULT '{
  "entreprise": true,
  "contrats": true,
  "juridique": true,
  "comptabilite": true,
  "finance": true
}'::jsonb;

-- Maintenant on peut supprimer owner_id
ALTER TABLE public.companies DROP COLUMN owner_id;

-- Supprimer permissions et invited_by de user_companies
ALTER TABLE public.user_companies DROP COLUMN permissions;
ALTER TABLE public.user_companies DROP COLUMN invited_by;

-- Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS public.is_company_owner(UUID);
DROP FUNCTION IF EXISTS public.get_user_company_permissions(UUID);
DROP FUNCTION IF EXISTS public.has_permission(UUID, TEXT);

-- Nouvelle fonction pour recuperer les permissions de l'entreprise
CREATE OR REPLACE FUNCTION public.get_company_permissions(target_company_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT permissions FROM public.companies 
     WHERE id = target_company_id),
    '{}'::jsonb
  );
$$;

-- Nouvelle fonction has_permission
CREATE OR REPLACE FUNCTION public.has_permission(target_company_id UUID, section_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT (permissions->>section_name)::boolean 
     FROM public.companies 
     WHERE id = target_company_id),
    false
  ) AND public.is_member_of_company(target_company_id);
$$;

-- Nouvelles policies pour companies
CREATE POLICY "Members can update their company"
  ON public.companies FOR UPDATE
  USING (public.is_member_of_company(id));

CREATE POLICY "Anyone can create a company"
  ON public.companies FOR INSERT
  WITH CHECK (true);

-- Nouvelles policies pour user_companies
CREATE POLICY "Members can add users to their company"
  ON public.user_companies FOR INSERT
  WITH CHECK (public.is_member_of_company(company_id));

CREATE POLICY "Members can remove users from their company"
  ON public.user_companies FOR DELETE
  USING (public.is_member_of_company(company_id));