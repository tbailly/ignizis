

## Drag & Drop : colonnes en mode "drop zone" (sauf colonne d'origine)

### Comportement

Pendant un drag, toutes les colonnes **sauf celle d'origine** de la carte se transforment en zones de drop visuelles. La colonne d'origine garde son affichage normal (cartes visibles, reordonnement possible).

### Modifications

**1. `KanbanBoard.tsx`** : passer le statut d'origine aux colonnes

- Deriver `draggingFromStatus` depuis `activeRequest?.status ?? null`
- Passer a chaque `KanbanColumn` une prop `dropZoneMode` : `true` si un drag est actif ET que le statut de la colonne est different du statut d'origine, `false` sinon

```text
dropZoneMode={!!activeRequest && status !== activeRequest.status}
```

**2. `KanbanColumn.tsx`** : double mode d'affichage

Ajouter une prop `dropZoneMode?: boolean` (defaut `false`).

Quand `dropZoneMode` est `true` :
- Masquer le header (label + badge) et les cartes
- Afficher a la place une grande zone centree occupant toute la hauteur avec :
  - Le label du statut en gros (`text-lg font-bold text-muted-foreground`)
  - Fond `bg-accent/20` et bordure en pointilles (`border-2 border-dashed border-accent/40`)
  - Au hover (`isOver`) : fond `bg-accent/50`, bordure pleine et coloree (`border-solid border-primary`), texte en `text-primary`
  - Transition fluide (`transition-all duration-200`)

Quand `dropZoneMode` est `false` : comportement actuel inchange (header, cartes, SortableContext).

### Rendu visuel

```text
  Drag depuis "New Request" :

  +-----------+  +----------+  +----------+
  | New Req [2]| | ........ |  | ........ |
  |-----------|  | .      . |  | .      . |
  | Card B    |  | . Quote. |  | . In   . |
  |           |  | . Pend . |  | . Prog . |
  |           |  | .      . |  | .      . |
  +-----------+  | ........ |  | ........ |
       ^         +----------+  +----------+
  colonne             ^             ^
  d'origine      drop zones (border-dashed)
  inchangee      hover => bg-accent/50 + border-solid
```

### Resume technique

| Fichier | Changement |
|---------|-----------|
| `KanbanBoard.tsx` | Passer `dropZoneMode={!!activeRequest && status !== activeRequest.status}` a chaque colonne |
| `KanbanColumn.tsx` | Prop `dropZoneMode` : si true, afficher zone de drop centree avec label ; sinon affichage normal |
| `KanbanCard.tsx` | Aucun changement |

