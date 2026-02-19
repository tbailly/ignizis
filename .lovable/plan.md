

# Creation de la table `officer_company_assignments`

## Constat

- La colonne `company_id` a ete supprimee de `company_officers` (OK)
- Le code frontend (`CompanyFormDialog`, `AdminOfficers`, `OfficerFormDialog`, `Entreprise`) reference deja `officer_company_assignments` (OK)
- **Mais la table `officer_company_assignments` n'a jamais ete creee en base**
- Les donnees de liaison existantes sont perdues (accepte par l'utilisateur)

## Action requise : une seule migration SQL

Creer la table `officer_company_assignments` avec :

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid PK, default gen_random_uuid() | Identifiant |
| officer_id | uuid FK -> company_officers.id ON DELETE CASCADE, NOT NULL | Mandataire |
| company_id | uuid FK -> companies.id ON DELETE CASCADE, NOT NULL | Entreprise |
| created_at | timestamptz, default now() | Date de creation |

Contrainte UNIQUE sur `(officer_id, company_id)`.

Activer RLS et creer les politiques :
- **SELECT** : admins (`is_admin(auth.uid())`) + membres de l'entreprise (`is_member_of_company(company_id)`)
- **INSERT / UPDATE / DELETE** : admins uniquement

## Fichiers a modifier

Aucun fichier frontend a modifier -- tout le code est deja en place et utilise la table `officer_company_assignments`. Il suffit de creer la table manquante.

## Detail technique de la migration

```text
CREATE TABLE public.officer_company_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id uuid NOT NULL REFERENCES public.company_officers(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (officer_id, company_id)
);

ALTER TABLE public.officer_company_assignments ENABLE ROW LEVEL SECURITY;

-- SELECT: admins
CREATE POLICY "Admins can view all assignments"
  ON public.officer_company_assignments FOR SELECT
  USING (public.is_admin(auth.uid()));

-- SELECT: members of the company
CREATE POLICY "Members can view company assignments"
  ON public.officer_company_assignments FOR SELECT
  USING (public.is_member_of_company(company_id));

-- INSERT: admins only
CREATE POLICY "Admins can insert assignments"
  ON public.officer_company_assignments FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- UPDATE: admins only
CREATE POLICY "Admins can update assignments"
  ON public.officer_company_assignments FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- DELETE: admins only
CREATE POLICY "Admins can delete assignments"
  ON public.officer_company_assignments FOR DELETE
  USING (public.is_admin(auth.uid()));
```

Pas de populate de donnees -- les associations seront recrees manuellement via l'interface admin.

