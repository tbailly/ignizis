

## Corrections du formulaire d'import de documents

### 1. Placeholder "Select" vide sur le champ Type

Dans `DocumentUploadDialog.tsx`, remplacer le `placeholder={t('common.select')}` du `SelectValue` par un espace vide (`placeholder=" "` ou `placeholder=""`), pour que le champ apparaisse vide au lieu d'afficher "Select".

### 2. Bouton d'import disabled tant que tous les types ne sont pas remplis

Dans `DocumentUploadDialog.tsx`, modifier la condition `disabled` du bouton d'import (ligne 306) :

Actuellement : `disabled={saving || entries.length === 0}`

Nouvelle condition : `disabled={saving || entries.length === 0 || entries.some(e => !e.linkedId || !e.documentType)}`

Cela verifie que chaque entry a bien un `linkedId` (entreprise ou mandataire) ET un `documentType` rempli.

### 3. Ne reset le type que lors d'un changement de categorie (company <-> officer)

Dans `handleEntityChange` (ligne 117-119), ne remettre `documentType` a `''` que si le `linkedType` change de categorie. Si on reste dans la meme categorie (company -> company ou officer -> officer), conserver le type selectionne.

Modifier `handleEntityChange` :

```typescript
const handleEntityChange = (index: number, newLinkedType: 'company' | 'officer' | null, newLinkedId: string | null) => {
  const currentEntry = entries[index];
  const typeChanged = currentEntry.linkedType !== newLinkedType;
  updateEntry(index, {
    linkedType: newLinkedType,
    linkedId: newLinkedId,
    ...(typeChanged ? { documentType: '' } : {}),
  });
};
```

### 4. Bouton d'import disabled si un champ "Company or corporate officer" est vide

Deja couvert par le point 2 : la condition `entries.some(e => !e.linkedId || !e.documentType)` inclut la verification de `linkedId`.

---

### Resume technique

| Fichier | Modification |
|---------|-------------|
| `DocumentUploadDialog.tsx` ligne 251 | Remplacer `placeholder={t('common.select')}` par `placeholder=" "` |
| `DocumentUploadDialog.tsx` ligne 306 | Ajouter `entries.some(e => !e.linkedId || !e.documentType)` a la condition disabled |
| `DocumentUploadDialog.tsx` lignes 117-119 | Ne reset `documentType` que si `linkedType` change |

