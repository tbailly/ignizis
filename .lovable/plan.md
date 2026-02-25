

## Responsiveness de la page `/companies`

### 1. `src/components/layout/MainLayout.tsx` — Réduire le padding sur mobile

Changer `p-6` en `p-4 md:p-6` sur le `<main>`.

### 2. `src/pages/Entreprise.tsx` — Adapter titre et espacements

- Titre : `text-3xl` → `text-2xl md:text-3xl`
- Espacement global : `space-y-6` → `space-y-4 md:space-y-6`
- Gap grille cards : `gap-6` → `gap-4 md:gap-6`

### 3. `src/components/company/DocumentsSection.tsx` — Remplacer la table par des cartes responsives

Supprimer entièrement la `<Table>` et la remplacer par une grille de cartes, identique sur mobile et desktop. La grille s'adapte avec `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3`.

Chaque carte :

```text
┌──────────────────────────┐
│ Nom du document          │
│ [Tag1] [Tag2]            │
│ 25/02/2026     👁  ⬇     │
└──────────────────────────┘
```

- Ligne 1 : `display_name` en `font-medium text-sm`, truncate si trop long
- Ligne 2 : badges des tags (flex-wrap)
- Ligne 3 : date à gauche (text-xs text-muted-foreground), boutons actions à droite (flex justify-between items-center)

Structure JSX de chaque carte :

```tsx
<div className="p-3 border rounded-lg space-y-2">
  <p className="text-sm font-medium truncate">{doc.display_name}</p>
  <div className="flex flex-wrap gap-1">
    {(tagMap[doc.id] || []).map(tag => (
      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
    ))}
  </div>
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</span>
    <div className="flex items-center gap-1">
      {isPdf(doc) && <Button variant="ghost" size="icon" ...><Eye /></Button>}
      <Button variant="ghost" size="icon" ...><Download /></Button>
    </div>
  </div>
</div>
```

Réduire aussi le padding du CardHeader : `pb-3 md:pb-4`.

### Résumé technique

| Fichier | Modification |
|---------|-------------|
| `MainLayout.tsx` | `p-6` → `p-4 md:p-6` |
| `Entreprise.tsx` ligne 105 | `space-y-6` → `space-y-4 md:space-y-6` |
| `Entreprise.tsx` ligne 107 | `text-3xl` → `text-2xl md:text-3xl` |
| `Entreprise.tsx` ligne 111 | `gap-6` → `gap-4 md:gap-6` |
| `DocumentsSection.tsx` | Supprimer la `<Table>` entière, la remplacer par une grille de cartes `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3` |
| `DocumentsSection.tsx` | CardHeader padding : `pb-4` → `pb-3 md:pb-4` |

