## Ajout de la ville de naissance des mandataires sociaux

### 1. Migration base de donnees

Ajouter une colonne `birth_city` (TEXT, NOT NULL) a la table `company_officers`. La valeur par defaut `' '` est appliquee a toutes les lignes existantes.

```sql
ALTER TABLE public.company_officers
  ADD COLUMN birth_city text NOT NULL;
```

### 2. Table admin des mandataires (`src/pages/admin/AdminOfficers.tsx`)

- Ajouter `birth_city` a l'interface `OfficerWithCompanies`
- Ajouter une colonne "Birth city" dans le tableau, apres "Date of birth"
- Mettre a jour le `colSpan` de 6 a 7
- Ajouter la cle i18n `admin.officers.birthCity`

### 3. Formulaire de creation/modification (`src/components/admin/OfficerFormDialog.tsx`)

- Ajouter un state `birthCity` initialise depuis `officer.birth_city` ou vide
- Ajouter un champ Input apres la date de naissance avec le label "Birth city"
- Inclure `birth_city` dans les operations INSERT et UPDATE
- Ajouter `birth_city` a la validation (champ obligatoire, non vide)

### 4. Page entreprise (`src/pages/Entreprise.tsx`)

- Ajouter `birth_city` a l'interface `Officer` et au SELECT de la query
- Remplacer la ligne date de naissance par le format : `Born on {month} {year} in {city}`
  - Exemple : "Born on January 1990 in Paris"
  - Si pas de date : afficher uniquement "Born in {city}" ou "—"
- Ajouter la cle i18n `company.bornOnIn` avec la valeur `"Born on {date} in {city}"`

### 5. Traductions (`src/i18n/locales/en.json`)

Nouvelles cles :

```json
"admin.officers.birthCity": "Birth city"
"company.bornOnIn": "Born on {date} in {city}"
```

### Recapitulatif


| Element                 | Action                                            |
| ----------------------- | ------------------------------------------------- |
| Migration SQL           | +colonne `birth_city` TEXT NOT NULL               |
| `AdminOfficers.tsx`     | +colonne "Birth city" dans le tableau             |
| `OfficerFormDialog.tsx` | +champ Input "Birth city" apres date de naissance |
| `Entreprise.tsx`        | Format "Born on January 1990 in Paris"            |
| `en.json`               | +cles i18n                                        |
