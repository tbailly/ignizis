
# Gestion des tags depuis la page Documents

## Vue d'ensemble

Ajouter un bouton "Manage tags" a cote du bouton "Import" dans la page Documents. Ce bouton ouvre une modale permettant de :
- Voir la liste des tags existants
- Ajouter un nouveau tag
- Renommer un tag (edition inline)
- Supprimer un tag (avec confirmation par saisie du nom)

---

## 1. Nouveau composant `src/components/admin/TagManagementDialog.tsx`

Modale (Dialog) contenant :

### Liste des tags
- Chaque tag affiche son nom + icone Pencil (edition) + icone Trash2 (suppression)
- Les tags sont charges via react-query (`document_tags`)

### Edition inline
- Cliquer sur Pencil transforme le nom en Input editable, et l'icone Pencil devient une icone Check (sauvegarde)
- Cliquer sur Check fait un `UPDATE` sur `document_tags` puis rafraichit la liste
- Possibilite d'annuler avec Echap ou un bouton X

### Ajout d'un tag
- Un champ Input + bouton "Add" en bas de la liste
- Insert dans `document_tags`, puis rafraichissement

### Suppression d'un tag
- Cliquer sur Trash2 ouvre une sous-modale (AlertDialog) de confirmation
- L'utilisateur doit saisir le nom exact du tag pour valider
- La suppression cascade automatiquement les `document_tag_assignments` grace aux FK

---

## 2. Modifications de `AdminDocuments.tsx`

- Ajouter un state `showTagManager` et un bouton "Manage tags" (icone Tags) a cote du bouton Import
- Rendre le composant `TagManagementDialog` conditionnel
- Invalider aussi `admin-documents` apres modification de tags (pour rafraichir les badges)

---

## 3. Traductions (`en.json`)

Ajouter sous `admin.documents` :
- `manageTags` : "Manage tags"
- `addTag` : "Add"
- `tagName` : "Tag name"
- `tagRenameSuccess` : "Tag renamed"
- `tagCreateSuccess` : "Tag created"
- `tagDeleteSuccess` : "Tag deleted"
- `tagDeleteConfirmTitle` : "Delete tag"
- `tagDeleteConfirmDesc` : "This action is irreversible. Type the tag name to confirm:"
- `tagDeleteConfirmButton` : "Delete permanently"
- `noTags` : "No tags yet"

---

## 4. Resume des fichiers

| Fichier | Action |
|---------|--------|
| `src/components/admin/TagManagementDialog.tsx` | Creer |
| `src/pages/admin/AdminDocuments.tsx` | Ajouter bouton + state |
| `src/i18n/locales/en.json` | Ajouter traductions |

Aucune migration SQL necessaire : les politiques RLS existantes sur `document_tags` autorisent deja les admins a inserer, modifier et supprimer.
