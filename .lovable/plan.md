

## Plan : Icônes PWA maskable + apple-touch-icon

### Étapes

1. **Copier le logo** uploadé (`ignizis-logo.png`) dans `public/icons/` pour l'utiliser comme icône PWA
2. **Mettre à jour `public/manifest.json`** : ajouter des entrées d'icônes 192x192 et 512x512 avec `purpose: "any maskable"` pointant vers le logo
3. **Mettre à jour `index.html`** : ajouter `<link rel="apple-touch-icon" href="/icons/ignizis-logo.png">` (les meta tags iOS sont déjà en place)

### Fichiers

| Fichier | Action |
|---------|--------|
| `public/icons/ignizis-logo.png` | Copie du logo uploadé |
| `public/manifest.json` | Ajout icônes 192/512 avec `"purpose": "any maskable"` |
| `index.html` | Ajout `<link rel="apple-touch-icon">` |

### Note sur maskable

Le logo uploadé a un fond blanc et le motif est centré — il respecte la safe zone 80%. On le déclare `"any maskable"` pour qu'Android puisse le découper en forme adaptative.

