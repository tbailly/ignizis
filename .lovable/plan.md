

## Plan de refactoring : uniformisation du rouge #da1e28

### Probleme

La variable CSS `--destructive` est actuellement definie sur `5 68% 73%` (Skinstone #E7948F, un rose saumon), alors que la charte Ignizis impose `#da1e28` pour tout ce qui est destructif/erreur/danger. Tous les composants utilisant `text-destructive`, `bg-destructive`, `border-destructive` heritent donc de la mauvaise couleur.

### Solution : un seul changement central

Modifier `--destructive` dans `src/index.css` (light et dark) pour pointer vers #da1e28 en HSL. Cela corrige automatiquement tous les composants qui referencent cette variable (boutons, badges, toasts, alerts, formulaires, icones).

`#da1e28` en HSL = environ `356 78% 49%`.

### Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/index.css` | Remplacer `--destructive: 5 68% 73%` par `--destructive: 356 78% 49%` dans `:root` ET `.dark` |
| `src/components/ui/toast.tsx` | Remplacer les classes Tailwind hardcodees `text-red-300`, `hover:text-red-50`, `focus:ring-red-400`, `ring-offset-red-600` par les equivalents `text-destructive-foreground` / variables destructive |
| `src/pages/admin/AdminDocuments.tsx` | Ligne 223 : remplacer le badge expiry par `variant="success"` / `variant="danger"` au lieu de classes inline `bg-green-600` et `variant="destructive"` |

### Detail technique

1. **`src/index.css`** — Changement central, 2 lignes (light + dark) :
   ```css
   --destructive: 356 78% 49%; /* #da1e28 */
   ```

2. **`toast.tsx`** — Le `ToastClose` utilise des couleurs `red-*` hardcodees dans les groupes destructive. Les remplacer par des references a la variable destructive pour coherence.

3. **`AdminDocuments.tsx`** — Le badge d'expiration utilise `variant="destructive"` (expire) et des classes inline `bg-green-600` (valide). Remplacer par `variant="danger"` et `variant="success"` comme les autres pages.

Aucun autre fichier ne necessite de changement : tous les usages de `text-destructive`, `bg-destructive`, `border-destructive` dans button.tsx, alert.tsx, form.tsx, badge.tsx, TagManagementDialog, AdminUsers, AdminOfficers, RequestFormDialog etc. heritent automatiquement de la variable CSS.

