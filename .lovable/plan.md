

## Diagnostic : DropdownMenu Radix ne s'ouvre pas sur iOS Safari

### Cause identifiée

C'est un bug connu de Radix UI (issue #2580). Le composant `DropdownMenuTrigger` utilise `onPointerDown` au lieu de `onClick` pour gérer l'ouverture. Or les événements `onPointer*` sont historiquement buggués sur iOS Safari — le navigateur ne les déclenche pas toujours correctement, surtout dans des conteneurs scrollables comme les tables.

Cela explique pourquoi ça marche sur Android (Chrome gère correctement les pointer events) mais pas sur iPhone (Safari).

### Solution

Ajouter un hack global dans `App.tsx` (ou `main.tsx`) qui force iOS Safari à initialiser son système de pointer events en attachant un listener vide `pointerdown` sur `document.body`. C'est la solution recommandée dans le thread GitHub de Radix.

### Fichier à modifier

| Fichier | Modification |
|---------|-------------|
| `src/App.tsx` | Ajouter un `useEffect` au montage qui attache un listener `pointerdown` vide sur `document.body`, puis le retire au démontage. Ce one-liner corrige le problème pour tous les `DropdownMenu` de l'app. |

### Code

```typescript
useEffect(() => {
  // iOS Safari: force pointer event system initialization (Radix UI workaround)
  const noop = () => {};
  document.body.addEventListener('pointerdown', noop);
  return () => document.body.removeEventListener('pointerdown', noop);
}, []);
```

Ce fix est global et corrige le problème pour toutes les pages (companies, documents, etc.) sans toucher aux composants individuels.

