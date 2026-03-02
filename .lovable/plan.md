

## Plan : Dropzone pour l'import de documents

### Changement

Remplacer le `<Input type="file">` brut par une dropzone stylisée dans `DocumentUploadDialog.tsx`, et ajouter un compteur de documents dans le titre de la modale.

### Fichiers a modifier

#### 1. `src/components/admin/DocumentUploadDialog.tsx`

**Dropzone** : Remplacer le bloc `<Input type="file">` (lignes 212-219) par une zone cliquable avec drag-and-drop :
- Un `div` avec bordure en pointilles (`border-dashed`), arrondi, qui reagit au hover et au drag-over (changement de couleur de fond)
- Icone `Upload` centree
- Texte principal : "Click or drop files to import" (i18n)
- L'`<input type="file">` reste present mais cache (`hidden`), declenche par le clic sur la zone
- Gestion du `onDragOver`, `onDragLeave`, `onDrop` pour accepter les fichiers deposes

**Compteur dans le titre** : Modifier le `DialogTitle` pour afficher le nombre de documents en cours quand `entries.length > 0`, par exemple : "Import (3 documents)" a cote du titre, sous forme de badge ou texte secondaire.

#### 2. `src/i18n/locales/en.json`

Ajouter les cles dans `admin.documents` :
- `"dropzoneText": "Click or drop files to import"`
- `"dropzoneHint": "You can add more files at any time"`
- `"documentCount": "{count} document(s)"`

### Detail technique

Le composant gere un state `isDragging` pour le style visuel au survol. L'input file cache est reference par le `fileInputRef` existant. Le `onDrop` extrait les fichiers de `e.dataTransfer.files` et les passe a la meme logique que `handleFilesSelected`.

