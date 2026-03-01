

## Refactor : compliance mandataires sociaux par date (comme les entreprises)

### Concept

Remplacer `is_compliant: boolean` par `compliant_until: date` sur `company_officers`. La valeur est calculée comme le **minimum** des `expires_at` des 3 documents liés (passport, secondary_id, power_of_attorney). Si un document manque ou n'a pas de date, `compliant_until = NULL` (non conforme).

### 1. Migration SQL

- Ajouter colonne `compliant_until date DEFAULT NULL` sur `company_officers`
- Supprimer la colonne `is_compliant`
- Mettre à jour la vue `active_company_officers` pour remplacer `is_compliant` par `compliant_until`
- Créer une fonction `recalculate_officer_compliant_until(p_officer_id uuid)` qui :
  - Récupère les `expires_at` des 3 documents liés
  - Si les 3 sont non-NULL, fait `UPDATE company_officers SET compliant_until = LEAST(d1.expires_at, d2.expires_at, d3.expires_at)`
  - Sinon `compliant_until = NULL`
- Supprimer les anciennes fonctions : `recalculate_officer_compliance`, `recalculate_all_officer_compliance`, `trg_officer_compliance`, `trg_document_compliance`
- Créer un trigger `AFTER UPDATE` sur `company_officers` (quand les colonnes document_id changent) → appelle le recalcul
- Créer un trigger `AFTER UPDATE` sur `documents` (quand `expires_at` change) → recalcule les officers liés
- Supprimer le cron job pg_cron existant qui appelait `recalculate_all_officer_compliance`

### 2. Supprimer l'edge function `recalculate-compliance`

- Supprimer `supabase/functions/recalculate-compliance/index.ts`
- Retirer l'entrée de `supabase/config.toml`

### 3. AdminOfficers.tsx

- Remplacer `is_compliant: boolean` par `compliant_until: string | null` dans l'interface
- Modifier le select pour récupérer `compliant_until` au lieu de `is_compliant`
- Afficher le badge de la même manière que les entreprises : vert avec `(Xd)` si dans le futur, rouge sinon

### 4. Entreprise.tsx (section officers)

- Même refactor dans l'interface `Officer` et le select
- Badge avec jours restants comme les entreprises

### 5. OfficerFormDialog.tsx

- Aucun changement nécessaire (ne touche pas `is_compliant` / `compliant_until` directement)

### 6. Traductions

- Les clés existantes `admin.officers.compliant` / `nonCompliant` restent utilisées, pas de nouvelles clés nécessaires

### Fichiers impactés

| Fichier | Modification |
|---------|-------------|
| Migration SQL | Colonne `compliant_until`, fonctions, triggers, suppression cron |
| `supabase/functions/recalculate-compliance/` | Suppression |
| `src/pages/admin/AdminOfficers.tsx` | `is_compliant` → `compliant_until` + badge avec jours |
| `src/pages/Entreprise.tsx` | Idem pour la section officers |

