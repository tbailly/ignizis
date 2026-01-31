-- Corriger la policy INSERT trop permissive sur companies
-- L'utilisateur doit être authentifié pour créer une entreprise
DROP POLICY IF EXISTS "Anyone can create a company" ON public.companies;

CREATE POLICY "Authenticated users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);