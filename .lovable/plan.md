

## Ajouter un lien externe pour la section Finance (comme Accounting)

### 1. Migration SQL

Ajouter `finance_software_url text DEFAULT NULL` à la table `companies` et mettre à jour la vue `active_companies`.

### 2. CompanyFormDialog.tsx

Sous le toggle Finance (même pattern que le bloc `permAccounting` + input URL) : afficher un input URL conditionnel quand `permFinance` est activé.

### 3. CompanyContext.tsx

Ajouter `finance_software_url: string | null` dans l'interface `Company` et dans les selects.

### 4. Finance.tsx

Calquer sur `Comptabilite.tsx` : si `finance_software_url` existe, afficher un CTA avec `ExternalLink` qui ouvre l'URL dans un nouvel onglet. Sinon, message "pas de lien configuré".

### 5. Traductions (en.json)

Ajouter les clés : `finance.softwareDescription`, `finance.openSoftware`, `finance.noSoftwareUrl`, `admin.companies.financeSoftwareUrl`, `admin.companies.financeSoftwareUrlPlaceholder`.

### Fichiers impactés

| Fichier | Modification |
|---------|-------------|
| Migration SQL | `finance_software_url` sur `companies` + vue `active_companies` |
| `src/components/admin/CompanyFormDialog.tsx` | Input URL conditionnel sous toggle Finance |
| `src/contexts/CompanyContext.tsx` | Ajout champ dans interface + selects |
| `src/pages/Finance.tsx` | CTA externe comme Comptabilite.tsx |
| `src/i18n/locales/en.json` | Nouvelles clés |

