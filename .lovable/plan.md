

## Ajout d'un identifiant 4 chiffres, carte entierement draggable, suppression dans la modale

### 1. Migration base de donnees

Ajouter une colonne `request_number` (integer, unique, NOT NULL) a la table `requests`. Cette colonne stockera un nombre entre 1000 et 9999 genere aleatoirement a la creation.

```sql
ALTER TABLE public.requests
  ADD COLUMN request_number integer NOT NULL DEFAULT 0
  CONSTRAINT requests_number_range CHECK (request_number >= 1000 AND request_number <= 9999);

CREATE UNIQUE INDEX requests_number_unique ON public.requests (request_number);
```

---

### 2. Modifications des fichiers

#### `src/components/admin/RequestFormDialog.tsx`

- Ajouter `request_number` a l'interface `RequestData`
- A la creation : generer un nombre aleatoire entre 1000 et 9999, verifier son unicite en base (boucle retry), l'inclure dans l'INSERT
- Afficher le numero en haut de la modale en mode edition (lecture seule, badge ou texte grise)
- Ajouter un bouton "Supprimer" en bas a gauche du `DialogFooter` (en mode edition uniquement), avec confirmation via `AlertDialog` — meme logique de suppression que celle actuellement dans `KanbanBoard.handleDelete`
- Le `DialogFooter` aura le bouton Delete a gauche et les boutons Cancel/Save a droite

#### `src/components/admin/KanbanCard.tsx`

- Supprimer l'icone `GripVertical` (poignee de drag) : appliquer `{...attributes} {...listeners}` directement sur le `div` racine de la carte pour la rendre entierement draggable
- Supprimer le bouton de suppression et tout l'`AlertDialog` associe
- Afficher le `request_number` (ex: `#1234`) devant le titre sur la carte
- Ajouter `cursor-grab active:cursor-grabbing` au `div` racine
- Simplifier l'interface : supprimer `onDelete` des props

#### `src/components/admin/KanbanColumn.tsx`

- Retirer `onDelete` des props (plus necessaire)

#### `src/components/admin/KanbanBoard.tsx`

- Retirer `handleDelete` et son passage en props aux colonnes
- Ajouter une prop `onDelete` recue du parent (`AdminRequests`) pour que la modale d'edition puisse supprimer
- Mettre a jour le `DragOverlay` (la carte dans l'overlay n'a plus besoin de `onDelete`)

#### `src/pages/admin/AdminRequests.tsx`

- Ajouter `request_number` dans la requete SELECT
- Inclure `request_number` dans le mapping des donnees
- Gerer la suppression depuis la modale : passer un callback `onDelete` a `RequestFormDialog`

#### `src/i18n/locales/en.json`

- Ajouter `"admin.requests.requestNumber": "Request #"` (ou similaire) pour l'affichage dans la modale

---

### 3. Logique de generation du numero

A la creation d'une request dans `RequestFormDialog.handleSave` :
1. Generer `Math.floor(Math.random() * 9000) + 1000`
2. Verifier qu'il n'existe pas deja via `SELECT id FROM requests WHERE request_number = $n`
3. Si pris, regenerer (boucle, max 20 tentatives)
4. Inclure dans l'INSERT

---

### Recapitulatif des fichiers

| Fichier | Action |
|---------|--------|
| Migration SQL | +colonne `request_number` (integer, unique, 1000-9999) |
| `RequestFormDialog.tsx` | +numero auto-genere, +bouton supprimer en mode edition, +affichage numero |
| `KanbanCard.tsx` | Carte entierement draggable, suppression poignee + bouton delete, affichage `#XXXX` |
| `KanbanColumn.tsx` | Retrait prop `onDelete` |
| `KanbanBoard.tsx` | Retrait `handleDelete`, simplification props colonnes |
| `AdminRequests.tsx` | +`request_number` dans le SELECT, +callback suppression |
| `en.json` | +cle i18n pour le numero de request |

