

## Refactor des selecteurs d'entreprises : code commun + active/inactive

### Approche : composant generique `ComboboxSelect`

Creer un composant generique `src/components/admin/ComboboxSelect.tsx` qui encapsule toute la logique Popover + Command + groupes actifs/inactifs. Les 3 composants existants deviennent des wrappers fins.

### 1. Nouveau composant `ComboboxSelect.tsx`

Props generiques :

```ts
interface ComboboxGroup {
  heading?: string;
  items: ComboboxItem[];
  className?: string; // ex: "opacity-50" pour inactifs
}

interface ComboboxItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ComboboxSelectProps {
  groups: ComboboxGroup[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear?: () => void;
  placeholder: string;
  emptyText: string;
  multiSelect?: boolean;        // true = reste ouvert apres selection
  renderTriggerLabel?: (selected: ComboboxItem[]) => React.ReactNode;
  renderBadges?: boolean;       // affiche les badges sous le trigger (pour multi)
  onRemove?: (id: string) => void;
}
```

Le composant gere :
- Popover open/close state
- Le trigger Button avec chevron + bouton clear
- Command avec CommandInput, CommandList, CommandEmpty
- Rendu de N `CommandGroup` avec heading et className sur chaque item
- Check icon selon `selectedIds.includes(item.id)`
- Fermeture auto du popover si `!multiSelect`

### 2. Refactor `CompanySelect.tsx`

Devient un wrapper qui :
- Separe `companies` en 2 groupes (actives / inactives par `status`)
- Passe `multiSelect={false}`, `selectedIds={value ? [value] : []}`
- `onToggle` appelle `onChange(id === value ? null : id)`

~15 lignes au lieu de 88.

### 3. Refactor `MultiCompanySelect.tsx`

Wrapper qui :
- Separe en 2 groupes actives/inactives
- `multiSelect={true}`, `renderBadges={true}`
- `onToggle` toggle dans le tableau, `onRemove` retire

~15 lignes au lieu de 100.

### 4. Refactor `EntitySelect.tsx`

Wrapper qui :
- Cree jusqu'a 4 groupes : companies actives, companies inactives, officers actifs (pas de status sur officers donc 1 seul groupe officers)
- Chaque item a une `icon` (Building2 / UserRound)
- `onToggle` gere la logique linkedType/linkedId

~30 lignes au lieu de 134.

### 5. Queries : ajouter `status` et utiliser `active_companies`

Identique au plan precedent :
- `UserFormDialog.tsx` : `active_companies`, select `id, name, status`, supprimer `.eq('status', 'active')`
- `OfficerFormDialog.tsx`, `DocumentUploadDialog.tsx`, `DocumentEditDialog.tsx` : ajouter `status` au select

### Resume

| Fichier | Action |
|---------|--------|
| `ComboboxSelect.tsx` (nouveau) | Composant generique Popover+Command avec groupes et active/inactive |
| `CompanySelect.tsx` | Wrapper ~15 lignes autour de ComboboxSelect |
| `MultiCompanySelect.tsx` | Wrapper ~15 lignes autour de ComboboxSelect |
| `EntitySelect.tsx` | Wrapper ~30 lignes autour de ComboboxSelect |
| `UserFormDialog.tsx` | Query `active_companies` + `status` |
| `OfficerFormDialog.tsx` | Ajouter `status` au select |
| `DocumentUploadDialog.tsx` | Ajouter `status` au select |
| `DocumentEditDialog.tsx` | Ajouter `status` au select |

