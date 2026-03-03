

## Plan : Boutons responsifs sur AdminDocuments

### Modification

Fichier `src/pages/admin/AdminDocuments.tsx`, lignes 150-166.

Remplacer le `flex items-center justify-between` par un layout qui wrap sur mobile : le titre sur une ligne, les boutons en dessous quand l'espace manque.

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
    <FileText className="h-8 w-8 text-primary" />
    {t('admin.documents.title')}
  </h1>
  <div className="flex gap-2">
    {/* buttons unchanged */}
  </div>
</div>
```

Sur mobile, le titre et les boutons s'empilent verticalement. Sur `sm+`, ils restent côte à côte.

### Fichier modifié

| Fichier | Modification |
|---------|-------------|
| `src/pages/admin/AdminDocuments.tsx` | Wrapper flex-col → sm:flex-row pour le header |

