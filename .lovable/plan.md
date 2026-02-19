

# Mandataires sociaux multi-entreprises

## Vue d'ensemble

Aujourd'hui, un mandataire (`company_officers`) est lie a une seule entreprise via la colonne `company_id`. L'objectif est de permettre a un mandataire d'etre associe a plusieurs entreprises, via une table de liaison.

---

## 1. Migration SQL

### Nouvelle table `officer_company_assignments`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK, default gen_random_uuid()) | Identifiant |
| officer_id | uuid (FK -> company_officers.id ON DELETE CASCADE) | Mandataire |
| company_id | uuid (FK -> companies.id ON DELETE CASCADE) | Entreprise |
| created_at | timestamptz (default now()) | Date de creation |

Contrainte UNIQUE sur (officer_id, company_id) pour eviter les doublons.

### Migration des donnees existantes

```text
INSERT INTO officer_company_assignments (officer_id, company_id)
SELECT id, company_id FROM company_officers WHERE company_id IS NOT NULL;
```

### Suppression de la colonne `company_id` sur `company_officers`

Apres la migration des donnees, supprimer la colonne `company_id` de `company_officers` (et sa FK associee).

### Politiques RLS sur `officer_company_assignments`

- SELECT : admins (is_admin) + membres de l'entreprise (is_member_of_company)
- INSERT / UPDATE / DELETE : admins uniquement

---

## 2. Modifications de `CompanyFormDialog.tsx`

### Chargement des mandataires (loadOfficers)

Remplacer la requete `.eq('company_id', companyId)` par une jointure via `officer_company_assignments` :

```text
SELECT company_officers.* 
FROM officer_company_assignments 
JOIN company_officers ON officer_company_assignments.officer_id = company_officers.id
WHERE officer_company_assignments.company_id = companyId
```

### Synchronisation (syncOfficers)

- A la creation d'un mandataire : inserer dans `company_officers` (sans company_id) puis creer l'entree dans `officer_company_assignments`
- A la suppression d'un mandataire depuis une entreprise : supprimer l'assignation dans `officer_company_assignments` (et non le mandataire lui-meme, sauf s'il n'a plus aucune assignation)
- Les mises a jour de nom/prenom/position restent directement sur `company_officers`

---

## 3. Modifications de `OfficerSection.tsx`

Aucune modification necessaire : ce composant gere uniquement la liste locale d'officers dans le formulaire. La logique de persistance est dans `CompanyFormDialog`.

---

## 4. Modifications de `AdminOfficers.tsx` (liste admin)

### Requete

Remplacer la jointure manuelle par :

```text
1. Charger tous les officers depuis company_officers
2. Charger les assignations depuis officer_company_assignments avec les noms d'entreprises
3. Grouper : chaque officer a un tableau de company_names (affiche comme badges multiples)
```

### Interface

- La colonne "Company" affiche plusieurs badges (un par entreprise associee) au lieu d'un seul

### Type `OfficerWithCompany`

Remplacer `company_id: string` et `company_name: string` par `companies: { id: string; name: string }[]`

---

## 5. Modifications de `OfficerFormDialog.tsx` (edition admin)

- Remplacer le champ "Company" (Input desactive avec un seul nom) par le composant `MultiCompanySelect` existant
- Charger la liste des entreprises disponibles
- Au save : mettre a jour `company_officers` pour les champs personnels, puis synchroniser `officer_company_assignments` (supprimer les anciennes, inserer les nouvelles)

---

## 6. Modifications de `Entreprise.tsx` (page entreprise)

Adapter la requete pour passer par `officer_company_assignments` :

```text
SELECT company_officers.* 
FROM officer_company_assignments 
JOIN company_officers ON officer_company_assignments.officer_id = company_officers.id
WHERE officer_company_assignments.company_id = currentCompanyId
```

---

## 7. Traductions (`en.json`)

Ajouter :
- `admin.officers.companies` : "Companies"
- `admin.officers.noCompanies` : "No company assigned"
- `admin.officers.selectCompanies` : "Select companies"

---

## 8. Resume des fichiers

| Fichier | Action |
|---------|--------|
| Migration SQL | Creer `officer_company_assignments`, migrer donnees, supprimer `company_id` de `company_officers` |
| `src/components/admin/CompanyFormDialog.tsx` | Adapter loadOfficers et syncOfficers pour la table de liaison |
| `src/components/admin/OfficerFormDialog.tsx` | Remplacer champ Company par MultiCompanySelect, synchroniser assignations |
| `src/pages/admin/AdminOfficers.tsx` | Adapter la requete et l'affichage multi-entreprises |
| `src/pages/Entreprise.tsx` | Adapter la requete pour passer par la table de liaison |
| `src/components/admin/DeleteOfficerDialog.tsx` | Aucun changement (la suppression cascade via FK) |
| `src/i18n/locales/en.json` | Ajouter traductions |

