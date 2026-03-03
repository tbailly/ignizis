

## Plan : Page Help dynamique avec contenu enrichi

### Objectif

Transformer la page Help en contenu dynamique éditable depuis l'admin, sur le même modèle que les pages légales. Renommer le fichier `Aide.tsx` en `Help.tsx`.

### Base de données

Insérer une nouvelle ligne dans `legal_pages` (la table existe déjà) :

```sql
INSERT INTO legal_pages (id, content_html) VALUES ('help', '');
```

Pas de migration de schéma nécessaire, juste un insert de données.

### Admin : nouvelle page d'édition

Créer `src/pages/admin/AdminHelp.tsx` — un éditeur Tiptap identique à `AdminLegalPages.tsx` mais pour une seule page (pas de tabs). Titre "Help Page", bouton Save, même toolbar.

### Sidebar admin

Ajouter un lien "Help Page" dans la sidebar admin (icône `Info`), route `/admin/help`.

### Page utilisateur

- Renommer `src/pages/Aide.tsx` → `src/pages/Help.tsx`
- Supprimer tout le contenu statique (FAQ, Contact)
- Garder uniquement : titre + sous-titre "Last update: {date}" + Card avec contenu HTML dynamique depuis `legal_pages` (id = `help`), même pattern que les pages légales

### Routing

- `App.tsx` : importer `Help` au lieu de `Aide`, ajouter route `/admin/help`
- Mettre à jour la référence dans la route `/help`

### Traductions

- Nettoyer les clés `help.*` inutiles (faq, contact, etc.) — garder `help.title` et `help.subtitle`
- Ajouter clés `adminHelp.title`, `adminHelp.description`, `adminHelp.saveSuccess`
- Ajouter `sidebar.adminHelp`

### Fichiers

| Fichier | Action |
|---------|--------|
| Insert données `legal_pages` | Ajouter ligne `help` |
| `src/pages/Aide.tsx` | Supprimer |
| `src/pages/Help.tsx` | Créer — fetch + rendu HTML dynamique |
| `src/pages/admin/AdminHelp.tsx` | Créer — éditeur Tiptap |
| `src/App.tsx` | Importer Help, ajouter route admin |
| `src/components/layout/AppSidebar.tsx` | Ajouter lien admin Help |
| `src/i18n/locales/en.json` | Nettoyer clés help, ajouter adminHelp |

