

## Ajouter la conformité d'entreprise avec date d'expiration

### 1. Migration SQL — Nouvelle colonne `compliant_until`

Ajouter à la table `companies` :
```sql
ALTER TABLE companies ADD COLUMN compliant_until date DEFAULT NULL;
```

Mettre à jour la vue `active_companies` pour inclure `compliant_until`.

### 2. Admin — Datatable `AdminCompanies.tsx`

- Ajouter une colonne **"Compliant"** entre "Status" et "Actions"
  - Badge vert `Compliant` + `(X days)` si `compliant_until >= today`
  - Badge rouge `Non-compliant` si `NULL` ou passé
- Remplacer le bouton Trash par un **bouton "..." (MoreHorizontal)** qui ouvre un `DropdownMenu` contenant :
  - Edit (icône Pencil)
  - **Validate compliance** (icône ShieldCheck) → ouvre une modale de confirmation
  - Delete (icône Trash2, texte rouge)
- Garder le bouton Edit existant tel quel
- **Modale de confirmation** : AlertDialog "Validate compliance for {company name} for the next 90 days?" avec bouton Confirm qui fait `UPDATE companies SET compliant_until = now() + interval '90 days' WHERE id = ...`

### 3. Page Entreprise (`Entreprise.tsx`)

- Dans le `CardTitle` de "Company details", ajouter à droite un badge :
  - Vert `Compliant` si `compliant_until >= today`
  - Rouge `Non-compliant` sinon

### 4. Traductions (`en.json`)

Ajouter :
```json
"compliant": "Compliant",
"nonCompliant": "Non-compliant",
"validateCompliance": "Validate compliance",
"validateComplianceConfirmTitle": "Validate compliance",
"validateComplianceConfirmDesc": "This will mark {name} as compliant for the next 90 days.",
"validateComplianceConfirmButton": "Confirm",
"validateComplianceSuccess": "Compliance validated",
"daysRemaining": "{days}d remaining"
```

### Fichiers impactés

| Fichier | Modification |
|---------|-------------|
| Migration SQL | `compliant_until date` sur `companies` + vue `active_companies` |
| `src/pages/admin/AdminCompanies.tsx` | Colonne Compliant, bouton "...", dropdown, modale |
| `src/pages/Entreprise.tsx` | Badge conformité dans le header de la card |
| `src/i18n/locales/en.json` | Nouvelles clés de traduction |

