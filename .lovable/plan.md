

## Améliorations UI de la page AdminDocuments

### 1. Scroll horizontal limité à la table

Actuellement le `Table` component wraps dans un `div.overflow-auto`. Le titre et la barre de recherche sont en dehors du `div.rounded-md.border` donc ils ne scrollent pas horizontalement — mais le conteneur parent `space-y-6` pourrait déborder. Il faut s'assurer que le wrapper de la table a bien `overflow-x-auto` et que le layout parent ne déborde pas.

Concrètement : ajouter `overflow-x-auto` sur le `div.rounded-md.border` qui entoure la `Table`, et s'assurer que le conteneur parent a `overflow-x-hidden` (cohérent avec la contrainte layout existante).

### 2. Actions : Eye + Pencil inline, "..." dropdown pour Download + Delete

Remplacer les 4 boutons d'action par :
- **Eye** (preview PDF, conditionnel) — inline
- **Pencil** (edit) — inline
- **MoreHorizontal** ("...") — ouvre un `DropdownMenu` contenant :
  - Download (icône Download)
  - Delete (icône Trash2, texte rouge)

Imports à ajouter : `MoreHorizontal` de lucide-react, `DropdownMenu*` de `@/components/ui/dropdown-menu`.

### 3. Type "Secondary ID" sur une seule ligne

Ajouter `whitespace-nowrap` sur le `Badge` dans la colonne type pour empêcher le retour à la ligne.

### 4. Colonne "Display name" : largeur fixe ~190px + troncature + tooltip au hover

- `TableHead` : ajouter `className="w-[190px] min-w-[190px] max-w-[190px]"`
- `TableCell` : ajouter `max-w-[190px] truncate` et wrapper le texte dans un `Tooltip` (de `@/components/ui/tooltip`) pour afficher le nom complet au hover.

### Fichier impacté

| Fichier | Modification |
|---------|-------------|
| `src/pages/admin/AdminDocuments.tsx` | Les 4 changements ci-dessus |

