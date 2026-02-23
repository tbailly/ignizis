## Ajout de l'URL du logiciel de comptabilite

### 1. Migration base de donnees

Ajouter une colonne `accounting_software_url` (TEXT, nullable) a la table `companies`.

```sql
ALTER TABLE public.companies
  ADD COLUMN accounting_software_url text;
```

### 2. Contexte entreprise (`src/contexts/CompanyContext.tsx`)

- Ajouter `accounting_software_url: string | null` a l'interface `Company`
- L'inclure dans le SELECT de la query existante

### 3. Formulaire admin (`src/components/admin/CompanyFormDialog.tsx`)

- Ajouter `accounting_software_url` a l'interface `CompanyData`
- Ajouter un state `accountingSoftwareUrl` initialise depuis `company.accounting_software_url`
- Ajouter un champ Input de type URL apres la section "Permissions > Accounting", avec le label "Accounting software URL"
- Inclure `accounting_software_url` dans le payload de sauvegarde

### 4. Page admin companies (`src/pages/admin/AdminCompanies.tsx`)

- Ajouter `accounting_software_url` a l'interface `CompanyWithUsers` et au SELECT

### 5. Page Comptabilite (`src/pages/Comptabilite.tsx`)

Quand `hasPermission('accounting')` est vrai, remplacer le placeholder actuel par :

- Un texte explicatif invitant l'utilisateur a acceder a son logiciel de comptabilite
- Un gros bouton (taille `lg`) avec une icone `ExternalLink` qui ouvre `currentCompany.company.accounting_software_url` dans un nouvel onglet (`window.open` ou `<a target="_blank">`)
- Si l'URL n'est pas definie, afficher le placeholder actuel (icone Calculator + message generique)

### 6. Traductions (`src/i18n/locales/en.json`)

Nouvelles cles :

```json
"admin.companies.accountingSoftwareUrl": "Accounting software URL",
"admin.companies.accountingSoftwareUrlPlaceholder": "https://...",
"accounting.softwareDescription": "Access your company's accounting software to manage your finances.",
"accounting.openSoftware": "Open accounting software",
"accounting.noSoftwareUrl": "No accounting software has been configured for this company."
```

### Recapitulatif


| Element                 | Action                                              |
| ----------------------- | --------------------------------------------------- |
| Migration SQL           | +colonne `accounting_software_url` TEXT nullable    |
| `CompanyContext.tsx`    | +champ dans l'interface Company + SELECT            |
| `CompanyFormDialog.tsx` | +champ Input URL dans le formulaire                 |
| `AdminCompanies.tsx`    | +champ dans l'interface + SELECT                    |
| `Comptabilite.tsx`      | Affichage conditionnel avec bouton vers le logiciel |
| `en.json`               | +cles i18n                                          |
