

## Utiliser `CompanySelect` dans `RequestFormDialog` + réordonner les sections inactive

### 1. `AdminRequests.tsx` — Ajouter `status` à la query companies

Ligne 52 : `.select('id, name')` → `.select('id, name, status')` et adapter le type `Company` pour inclure `status`.

### 2. `RequestFormDialog.tsx` — Remplacer le Popover inline par `CompanySelect`

- Adapter l'interface `Company` pour inclure `status?: string`
- Supprimer les imports inutilisés (`Popover`, `Command*`, `Check`, `ChevronsUpDown`, `cn`)
- Supprimer le state `companyOpen`
- Remplacer le bloc Popover (lignes 246-286) par `<CompanySelect companies={companies} value={companyId || null} onChange={(id) => setCompanyId(id || '')} />`

### 3. `CompanySelect.tsx` — Renommer "Inactives" → "Inactive companies"

Ligne 21 : remplacer `t('common.inactive')` par `t('common.inactiveCompanies')`.

### 4. `EntitySelect.tsx` — Réordonner les groupes et renommer

Changer l'ordre des groupes : active companies → officers → inactive companies (au lieu de active → inactive → officers). Remplacer `t('common.inactive')` par `t('common.inactiveCompanies')`.

### 5. `en.json` — Ajouter la clé `common.inactiveCompanies`

Ajouter `"inactiveCompanies": "Inactive companies"`.

### Résumé

| Fichier | Modification |
|---------|-------------|
| `AdminRequests.tsx` | Ajouter `status` au select + type |
| `RequestFormDialog.tsx` | Remplacer Popover inline par `<CompanySelect>`, supprimer imports inutiles |
| `CompanySelect.tsx` | `t('common.inactive')` → `t('common.inactiveCompanies')` |
| `EntitySelect.tsx` | Réordonner : actives → officers → inactives, renommer heading |
| `en.json` | Ajouter `"inactiveCompanies": "Inactive companies"` |

