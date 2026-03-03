

## Plan : Textes légaux enrichis modifiables depuis l'admin

### Objectif

Stocker les contenus des 3 pages légales (Legal Notice, Privacy Policy, Terms of Use) en HTML dans la base de données, les rendre éditables via un éditeur rich text côté admin, et les afficher côté utilisateur.

### Base de données

Créer une table `legal_pages` :

| Colonne | Type | Note |
|---------|------|------|
| id | text PK | Valeurs : `legal-notice`, `privacy`, `terms` |
| content_html | text | Contenu HTML |
| updated_at | timestamptz | Auto-update |

RLS : SELECT pour les utilisateurs authentifiés, UPDATE pour les admins.

Insérer les 3 lignes avec un contenu HTML par défaut vide.

### Éditeur rich text (Admin)

Utiliser **Tiptap** (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-link`) — léger, headless, compatible React.

Créer `src/pages/admin/AdminLegalPages.tsx` :
- 3 onglets (Tabs) : Legal Notice, Privacy Policy, Terms of Use
- Chaque onglet contient un éditeur Tiptap avec une toolbar (Bold, Italic, Underline, H1/H2/H3, Link, UL, OL)
- Bouton "Save" par onglet qui fait un `upsert` dans `legal_pages`

### Affichage utilisateur

Refactorer les 3 pages légales (`MentionsLegales.tsx`, `Confidentialite.tsx`, `CGU.tsx`) :
- Fetch le contenu HTML depuis `legal_pages` par ID
- Afficher via `dangerouslySetInnerHTML` dans un conteneur avec des styles prose (Tailwind `prose` via `@tailwindcss/typography`)

### Routing & Sidebar

- Ajouter la route `/admin/legal-pages` dans `App.tsx` sous les routes admin
- Ajouter un lien dans la sidebar admin (icône `Scale`)

### Fichiers

| Fichier | Action |
|---------|--------|
| Migration SQL | Créer table `legal_pages` + RLS + seed |
| `package.json` | Ajouter `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-link`, `@tailwindcss/typography` |
| `src/pages/admin/AdminLegalPages.tsx` | Nouveau — éditeur rich text avec 3 onglets |
| `src/pages/legal/MentionsLegales.tsx` | Refacto — fetch + rendu HTML |
| `src/pages/legal/Confidentialite.tsx` | Refacto — fetch + rendu HTML |
| `src/pages/legal/CGU.tsx` | Refacto — fetch + rendu HTML |
| `src/App.tsx` | Ajouter route admin |
| `src/components/layout/AppSidebar.tsx` | Ajouter lien sidebar admin |
| `src/i18n/locales/en.json` | Clés de traduction pour la page admin |
| `tailwind.config.ts` | Ajouter plugin `@tailwindcss/typography` |

