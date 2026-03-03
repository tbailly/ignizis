

## Plan : Sous-titre "Last update" + suppression du CardHeader

### Modifications sur les 3 pages légales

Chaque page (`CGU.tsx`, `MentionsLegales.tsx`, `Confidentialite.tsx`) sera modifiée de la même manière :

1. **Fetch `updated_at`** en plus de `content_html` depuis la requête Supabase
2. **Sous-titre** : remplacer le sous-titre actuel par `Last update: {formatted date}` en utilisant `format(new Date(updated_at), 'MMMM dd, yyyy')` de `date-fns`
3. **Supprimer le `CardHeader`** (qui contient le titre avec icône redondant), ne garder que le `CardContent` dans la `Card`

### Traductions

Ajouter une clé `common.lastUpdate` dans `en.json` : `"Last update:"`.

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/pages/legal/CGU.tsx` | Fetch `updated_at`, afficher sous-titre formaté, supprimer `CardHeader` |
| `src/pages/legal/Confidentialite.tsx` | Idem |
| `src/pages/legal/MentionsLegales.tsx` | Idem |
| `src/i18n/locales/en.json` | Ajouter `common.lastUpdate` |

