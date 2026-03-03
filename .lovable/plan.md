

## Plan : PWA — Manifest, meta tags iOS, service worker minimal

### Fichiers créés

| Fichier | Description |
|---------|-------------|
| `public/manifest.json` | Manifest PWA avec name, short_name, start_url, display standalone, theme/background colors (#3E00FF / #FAFAF9), icônes (favicon.ico) |
| `public/sw.js` | Service worker minimal (fetch passthrough) suffisant pour déclencher le prompt d'installation Chrome |

### Fichier modifié

| Fichier | Modification |
|---------|-------------|
| `index.html` | Ajouter `<link rel="manifest">`, meta tags iOS (`apple-mobile-web-app-capable`, `status-bar-style`, `title`), `<meta name="theme-color">`, et script d'enregistrement du service worker |

### Détail

**`public/manifest.json`** :
```json
{
  "name": "Ignizis - Launch Global Grow limitless",
  "short_name": "Ignizis",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3E00FF",
  "background_color": "#FAFAF9",
  "icons": [{ "src": "/favicon.ico", "sizes": "64x64", "type": "image/x-icon" }]
}
```

**`public/sw.js`** : Service worker minimal avec événements `install` (skip waiting) et `fetch` (passthrough réseau).

**`index.html`** : Ajout dans `<head>` du lien manifest, des 3 meta tags iOS, du theme-color, et dans `<body>` d'un `<script>` pour `navigator.serviceWorker.register('/sw.js')`.

