
## Modifications visuelles de la Sidebar

Trois changements ciblés dans `src/components/layout/AppSidebar.tsx` :

---

### 1. Supprimer le carré avec la première lettre de l'entreprise

**Header (entreprise active) — lignes 75–77 :**
Supprimer le `<div>` contenant la lettre initiale. Le bouton trigger affichera directement le nom de l'entreprise (et l'icône `ChevronsUpDown`). En mode collapsed, on peut afficher l'icône `Building2` à la place.

**Dropdown (liste des entreprises) — lignes 100–102 :**
Supprimer le `<div>` avec la lettre initiale dans chaque `DropdownMenuItem`.

---

### 2. Truncate du nom de l'entreprise active

Le nom est déjà dans un `<p className="text-sm font-medium truncate">`, mais le conteneur parent `<div className="flex-1 text-left">` n'a pas `min-w-0`, ce qui empêche le `truncate` de fonctionner dans un contexte flex. Ajouter `min-w-0` au `<div className="flex-1 text-left">` (ligne 80).

---

### 3. Cursor pointer sur les items du dropdown utilisateur

Les `DropdownMenuItem` du footer (Settings, Legal Notice, Privacy, Terms, Help, Logout) n'ont pas de `cursor-pointer` explicite. Ajouter `className="cursor-pointer"` à chacun d'eux.

---

### Détail technique des changements

**Fichier :** `src/components/layout/AppSidebar.tsx`

| Zone | Ligne(s) | Action |
|------|----------|--------|
| Header trigger — avatar carré | 75–77 | Supprimer le `<div>` avec la lettre initiale ; en mode collapsed, remplacer par l'icône `Building2` |
| Header trigger — conteneur nom | 80 | Ajouter `min-w-0` au div flex-1 |
| Dropdown entreprises — avatar carré | 100–102 | Supprimer le `<div>` avec la lettre initiale |
| Footer dropdown — tous les items | 244–286 | Ajouter `cursor-pointer` à chaque `DropdownMenuItem` |

Aucune dépendance extérieure ni migration base de données nécessaire.
