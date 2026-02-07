

# Remplacement du champ JSONB `permissions` par des colonnes booleennes + nouveaux champs entreprise

## Resume

Supprimer le champ JSONB `permissions` de la table `companies` et le remplacer par 3 colonnes booleennes (`perm_legal`, `perm_accounting`, `perm_finance`). Ajouter egalement 3 nouvelles colonnes d'information : `company_number`, `address`, `country`. Mettre a jour toutes les fonctions SQL, le contexte React, la sidebar, le dashboard et le formulaire admin en consequence.

---

## 1. Migration SQL

### Nouvelles colonnes

```sql
-- Colonnes informatives
ALTER TABLE public.companies ADD COLUMN company_number TEXT UNIQUE;
ALTER TABLE public.companies ADD COLUMN address TEXT;
ALTER TABLE public.companies ADD COLUMN country TEXT; -- Code ISO alpha-2

-- Colonnes booleennes de permissions (remplacent le JSONB)
ALTER TABLE public.companies ADD COLUMN perm_legal BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.companies ADD COLUMN perm_accounting BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.companies ADD COLUMN perm_finance BOOLEAN NOT NULL DEFAULT true;
```

### Migration des donnees existantes

Les 2 entreprises existantes ont des permissions en francais dans le JSONB. On migre les valeurs :

```sql
UPDATE public.companies
SET perm_legal = COALESCE((permissions->>'juridique')::boolean, true),
    perm_accounting = COALESCE((permissions->>'comptabilite')::boolean, true),
    perm_finance = COALESCE((permissions->>'finance')::boolean, true);
```

### Suppression de la colonne JSONB

```sql
ALTER TABLE public.companies DROP COLUMN permissions;
```

### Mise a jour des fonctions SQL

**`get_company_permissions`** : supprimee (plus de JSONB a retourner).

**`has_permission`** : reecrite pour lire les colonnes booleennes directement :

```sql
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
```

---

## 2. Fichiers frontend a modifier

### `src/contexts/CompanyContext.tsx`

- Supprimer l'interface `CompanyPermissions` basee sur le JSONB
- Mettre a jour l'interface `Company` pour avoir les 3 booleens directement (`perm_legal`, `perm_accounting`, `perm_finance`)
- Modifier le `select()` pour recuperer les nouvelles colonnes au lieu de `permissions`
- Reecrire `hasPermission` pour lire les colonnes booleennes :
  - `'entreprise'` et `'contrats'` retournent toujours `true` (sections toujours visibles)
  - `'legal'` lit `perm_legal`, `'accounting'` lit `perm_accounting`, `'finance'` lit `perm_finance`

### `src/components/layout/AppSidebar.tsx`

- Renommer les cles de permission dans `menuItems` :
  - `'juridique'` devient `'legal'`
  - `'comptabilite'` devient `'accounting'`

### `src/pages/Dashboard.tsx`

- Memes renommages dans le tableau `sections` :
  - `'juridique'` devient `'legal'`
  - `'comptabilite'` devient `'accounting'`

### `src/components/admin/CompanyFormDialog.tsx`

- Supprimer l'ancienne interface `CompanyData` avec `permissions: Record<string, boolean>`
- Mettre a jour `CompanyData` avec les nouveaux champs : `company_number`, `address`, `country`, `perm_legal`, `perm_accounting`, `perm_finance`
- Renommer les states internes (`permJuridique` -> `permLegal`, `permComptabilite` -> `permAccounting`)
- Ajouter les nouveaux champs au formulaire :
  - **Company number** : `Input` texte standard
  - **Address** : `Textarea` (multiline)
  - **Country** : `Select` avec les options : France (FR), UAE (AE), Hong Kong (HK), Switzerland (CH), Belgium (BE), United States (US)
- Modifier les appels `insert()` / `update()` pour envoyer les colonnes individuelles au lieu du JSONB `permissions`

### `src/pages/admin/AdminCompanies.tsx`

- Mettre a jour l'interface `CompanyWithUsers` : supprimer `permissions`, ajouter `company_number`, `address`, `country`, `perm_legal`, `perm_accounting`, `perm_finance`
- Mettre a jour le `select()` dans la query pour inclure les nouvelles colonnes

### `src/i18n/locales/en.json`

Ajouter les cles :
- `admin.companies.companyNumber` : "Company number"
- `admin.companies.address` : "Address"
- `admin.companies.addressPlaceholder` : "Enter company address..."
- `admin.companies.country` : "Country"
- `admin.companies.countryPlaceholder` : "Select a country"
- `admin.companies.countries.FR` : "France"
- `admin.companies.countries.AE` : "UAE"
- `admin.companies.countries.HK` : "Hong Kong"
- `admin.companies.countries.CH` : "Switzerland"
- `admin.companies.countries.BE` : "Belgium"
- `admin.companies.countries.US` : "United States"

---

## 3. Liste complete des fichiers modifies

| Fichier | Action |
|---------|--------|
| Migration SQL | Ajouter colonnes, migrer donnees, supprimer `permissions`, reecrire fonctions |
| `src/contexts/CompanyContext.tsx` | Supprimer `CompanyPermissions`, utiliser colonnes booleennes |
| `src/components/layout/AppSidebar.tsx` | Renommer cles de permission (`legal`, `accounting`) |
| `src/pages/Dashboard.tsx` | Renommer cles de permission (`legal`, `accounting`) |
| `src/components/admin/CompanyFormDialog.tsx` | Nouveaux champs + colonnes booleennes au lieu de JSONB |
| `src/pages/admin/AdminCompanies.tsx` | Mettre a jour interface et select query |
| `src/i18n/locales/en.json` | Ajouter cles de traduction |

---

## 4. Ordre des champs dans la modale entreprise

1. Company name (existant)
2. Slug (existant)
3. Company number (nouveau)
4. Address (nouveau, Textarea)
5. Country (nouveau, Select)
6. Status (existant)
7. Enabled options : Legal, Accounting, Finance (renommes)

---

## 5. Notes techniques

- `company_number` a une contrainte `UNIQUE` nullable : PostgreSQL autorise plusieurs `NULL` avec une contrainte UNIQUE, donc seules les valeurs non-null doivent etre uniques.
- Les sections `entreprise` et `contrats` restent toujours visibles (pas de toggle), donc `hasPermission` retourne `true` pour ces deux valeurs.
- La fonction SQL `get_company_permissions` est supprimee car inutile sans JSONB. La fonction `has_permission` est conservee et reecrite pour lire les colonnes booleennes directement.

