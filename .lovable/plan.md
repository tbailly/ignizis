

## Fix : detection de drop zone au curseur

### Probleme

L'algorithme de collision `closestCorners` calcule la distance entre les coins du draggable et les coins des droppables. Quand la colonne d'origine contient encore des items sortables, ceux-ci "captent" la collision et empechent les colonnes adjacentes d'etre detectees facilement.

### Solution

Remplacer `closestCorners` par `pointerWithin` dans `KanbanBoard.tsx`. Cet algorithme detecte le droppable **sous le pointeur**, ce qui fait que des que le curseur entre dans une colonne, elle est immediatement selectionnee.

### Modification

**`src/components/admin/KanbanBoard.tsx`** :

- Remplacer l'import `closestCorners` par `pointerWithin`
- Mettre a jour la prop `collisionDetection` du `DndContext`

| Fichier | Changement |
|---------|-----------|
| `KanbanBoard.tsx` | `closestCorners` remplace par `pointerWithin` (import + usage) |

Aucun autre fichier modifie. Le comportement de reordonnement dans la colonne d'origine reste fonctionnel car `pointerWithin` detecte aussi les items sortables quand le curseur est dessus.

