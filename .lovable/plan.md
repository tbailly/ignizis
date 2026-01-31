
# Plan de modification du modèle de données

## Contexte
Actuellement, les permissions sont stockées au niveau de chaque association utilisateur-entreprise (`user_companies.permissions`), et chaque entreprise a un propriétaire (`companies.owner_id`).

Le nouveau modèle simplifie cela :
- Les **permissions deviennent des options globales de l'entreprise** (stockées dans `companies`)
- La table `user_companies` devient une **simple table de liaison** sans permissions individuelles
- Il n'y a **plus de notion de propriétaire** d'entreprise

## Changements a effectuer

### 1. Migration de la base de donnees

**Modifications sur la table `companies` :**
- Supprimer la colonne `owner_id`
- Ajouter une colonne `permissions` (JSONB) avec la structure :
  ```json
  {
    "entreprise": true,
    "contrats": true,
    "juridique": true,
    "comptabilite": true,
    "finance": true
  }
  ```

**Modifications sur la table `user_companies` :**
- Supprimer la colonne `permissions`
- Supprimer la colonne `invited_by` (plus de notion de proprietaire qui invite)

**Suppression des fonctions obsoletes :**
- `is_company_owner()` - plus de proprietaire
- `get_user_company_permissions()` - permissions maintenant au niveau company
- `has_permission()` - a remplacer par une nouvelle version

**Nouvelle fonction :**
- `get_company_permissions(target_company_id)` - retourne les permissions de l'entreprise

### 2. Mise a jour des politiques RLS

**Sur `companies` :**
- Supprimer les policies liees a `owner_id`
- Permettre aux membres de voir leur entreprise (inchange)
- Permettre aux membres de mettre a jour leur entreprise (tous les membres peuvent modifier)
- Permettre la creation d'entreprise (l'utilisateur doit etre le premier membre)
- Permettre la suppression (par exemple si plus aucun membre)

**Sur `user_companies` :**
- Simplifier les policies d'insertion/suppression sans notion de proprietaire
- Les membres peuvent voir leurs associations
- Les membres peuvent ajouter/retirer d'autres utilisateurs

### 3. Mise a jour du code frontend

**`src/contexts/CompanyContext.tsx` :**
- Modifier l'interface `Company` : supprimer `owner_id`, ajouter `permissions`
- Modifier l'interface `UserCompany` : supprimer `permissions`
- Mettre a jour `hasPermission()` pour lire depuis `currentCompany.company.permissions`
- Adapter la requete `fetchCompanies()` pour recuperer les permissions depuis `companies`

**`src/integrations/supabase/types.ts` :**
- Ce fichier est auto-genere, il sera mis a jour automatiquement apres la migration

### 4. Donnees de test

Apres la migration, creer :
- Une entreprise "Ma Societe Test" avec toutes les permissions activees
- L'association avec l'utilisateur connecte

---

## Details techniques

### SQL de migration

```text
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

-- Supprimer owner_id de companies
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
```

### Nouvelles politiques RLS

```text
-- Supprimer les anciennes policies sur companies
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Owners can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Owners can delete their companies" ON public.companies;

-- Nouvelles policies pour companies
CREATE POLICY "Members can update their company"
  ON public.companies FOR UPDATE
  USING (public.is_member_of_company(id));

CREATE POLICY "Anyone can create a company"
  ON public.companies FOR INSERT
  WITH CHECK (true);

-- Supprimer les anciennes policies sur user_companies
DROP POLICY IF EXISTS "Company owners can invite users" ON public.user_companies;
DROP POLICY IF EXISTS "Company owners can remove users" ON public.user_companies;

-- Nouvelles policies pour user_companies
CREATE POLICY "Members can add users to their company"
  ON public.user_companies FOR INSERT
  WITH CHECK (public.is_member_of_company(company_id));

CREATE POLICY "Members can remove users from their company"
  ON public.user_companies FOR DELETE
  USING (public.is_member_of_company(company_id));
```

### Modifications du contexte React

Le `CompanyContext.tsx` sera modifie pour :
1. Lire `permissions` depuis `company.permissions` au lieu de `userCompany.permissions`
2. Supprimer `owner_id` de l'interface `Company`
3. Simplifier l'interface `UserCompany` (plus de permissions)
