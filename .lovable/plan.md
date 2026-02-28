

## Aligner l'application sur les Ignizis Branding Guidelines

### Palette de couleurs extraite du branding guide

| Nom | HEX | Usage |
|-----|-----|-------|
| Pulse Blue | #3E00FF | Primary / accents / CTA |
| Core Black | #000000 | Background principal (dark) |
| Cloud Grey | #FAFAF9 | Background clair / texte sur fond sombre |
| Soft Lilac | #DBD3FF | Accents secondaires, hover states |
| Shadow Lilac | #BFB8F8 | Variantes accent |
| Skinstone | #E7948F | Accent chaud, notifications, warnings |

### 1. Refonte du design system CSS (`src/index.css`)

Remap les CSS variables pour les deux modes :

**Mode dark (par défaut)** :
- `--background` : Core Black (#000000)
- `--foreground` : Cloud Grey (#FAFAF9)
- `--primary` : Pulse Blue (#3E00FF)
- `--primary-foreground` : blanc
- `--secondary` / `--muted` : nuances sombres dérivées (#0D0D15, #1A1A2E)
- `--accent` : Soft Lilac (#DBD3FF) avec foreground sombre
- `--border` / `--input` : gris sombre (#1F1F33)
- `--card` : légèrement plus clair que le background (#0A0A14)
- `--sidebar-background` : Core Black ou très légèrement off-black
- `--sidebar-primary` : Pulse Blue
- `--destructive` : Skinstone (#E7948F)

**Mode light (optionnel)** :
- `--background` : Cloud Grey (#FAFAF9)
- `--foreground` : Core Black (#000000)
- `--primary` : Pulse Blue (#3E00FF)
- `--card` : blanc
- Sidebar : fond clair, texte sombre

### 2. Typographie — Montserrat comme alternative Gotham

- Importer Montserrat (weights 300, 400, 700) depuis Google Fonts dans `index.html`
- Configurer `tailwind.config.ts` avec `fontFamily: { sans: ['Montserrat', ...] }`
- Supprimer toute référence à la font-family par défaut

### 3. Page d'authentification (`src/pages/Auth.tsx`)

- Fond noir plein écran avec gradient radial Pulse Blue (rappelant le style "digital application" du guide)
- Logo IGNIZIS en texte blanc bold ou image SVG en header
- Card de login semi-transparente avec bordure subtle lilac
- Bouton CTA en Pulse Blue

### 4. Sidebar (`src/components/layout/AppSidebar.tsx`)

- Fond Core Black
- Items actifs : highlight Pulse Blue
- Texte Cloud Grey, icônes Soft Lilac en hover
- Footer utilisateur : cohérent avec le thème sombre

### 5. Dashboard et pages internes

- Cards avec fond légèrement off-black, bordure subtile
- Badges et éléments d'accent utilisant Soft Lilac / Shadow Lilac
- Boutons primaires en Pulse Blue

### 6. Gradient brand comme élément décoratif

- Ajouter un gradient linéaire Core Black → Pulse Blue comme accent visuel sur la page Auth et potentiellement en header du dashboard

### 7. Thème par défaut à "dark"

- Modifier `ThemeContext.tsx` : initialiser `theme` à `'dark'` au lieu de `'system'`

### Fichiers impactés

| Fichier | Modification |
|---------|-------------|
| `index.html` | Import Google Fonts Montserrat |
| `src/index.css` | Refonte complète des CSS variables (dark par défaut, light optionnel) |
| `tailwind.config.ts` | Ajout fontFamily Montserrat |
| `src/pages/Auth.tsx` | Redesign avec gradient, logo, style Ignizis |
| `src/components/layout/AppSidebar.tsx` | Ajustements visuels sidebar |
| `src/contexts/ThemeContext.tsx` | Default theme → `'dark'` |

