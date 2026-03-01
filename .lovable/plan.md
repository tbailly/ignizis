

## Badges : whitespace-nowrap + couleurs succès/danger

### 1. Badge component (`src/components/ui/badge.tsx`)

- Ajouter `whitespace-nowrap` dans la classe de base du `cva`
- Ajouter deux nouveaux variants :
  - `success` : `bg-[#24A148]/15 text-[#24A148] border-[#24A148]/30`
  - `danger` : `bg-[#da1e28]/15 text-[#da1e28] border-[#da1e28]/30`

### 2. Remplacer les usages inline de `bg-green-100 text-green-800` et `variant="destructive"` pour la conformité

Fichiers impactés :
- `src/pages/admin/AdminCompanies.tsx` — badges compliance → `variant="success"` / `variant="danger"`
- `src/pages/admin/AdminOfficers.tsx` — idem
- `src/pages/Entreprise.tsx` — badges compliance entreprise + officers → idem

Partout où on avait `className="bg-green-100 text-green-800 ..."` → `variant="success"`, et `variant="destructive"` pour compliance → `variant="danger"`.

Note : `variant="destructive"` reste disponible pour les usages non-compliance (boutons, toasts, etc.).

