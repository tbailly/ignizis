

# Page d'administration "Documents"

## Vue d'ensemble

Ajouter une page `/admin/documents` permettant aux administrateurs d'importer, modifier et supprimer des documents. Les fichiers sont stockes dans un bucket de stockage, et les metadonnees (nom d'affichage, type, tags) dans une table `documents`. Les tags disponibles sont geres dans une table separee `document_tags`.

---

## 1. Migration SQL

### 1.1 Enum de type de document

Creer un type enum `document_type` avec les valeurs : `contract`, `invoice`, `other`.

### 1.2 Table `document_tags`

Table de reference pour les tags disponibles :

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK, gen_random_uuid() |
| name | text | NOT NULL, UNIQUE |
| created_at | timestamptz | DEFAULT now() |

Donnees par defaut inserees : `kbis`, `comptabilite`, `cloture`.

RLS :
- SELECT : tous les utilisateurs authentifies
- INSERT, UPDATE, DELETE : admins uniquement

### 1.3 Table `documents`

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK, gen_random_uuid() |
| display_name | text | NOT NULL |
| document_type | document_type (enum) | NOT NULL |
| storage_path | text | NOT NULL |
| original_filename | text | NOT NULL |
| file_size | bigint | Nullable |
| mime_type | text | Nullable |
| uploaded_by | uuid | NOT NULL |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

Trigger `update_updated_at_column` attache.

RLS :
- SELECT, INSERT, UPDATE, DELETE : admins uniquement (pour le moment, l'acces conditionne par les liens sera ajoute plus tard cote DB)

### 1.4 Table `document_tag_assignments` (jointure documents <-> tags)

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK, gen_random_uuid() |
| document_id | uuid | NOT NULL, FK -> documents(id) ON DELETE CASCADE |
| tag_id | uuid | NOT NULL, FK -> document_tags(id) ON DELETE CASCADE |
| UNIQUE(document_id, tag_id) | | |

RLS : memes regles que `documents`.

### 1.5 Bucket de stockage `documents`

Creer un bucket `documents` (non public). Politiques :
- SELECT (download) : admins uniquement (les politiques d'acces conditionnel seront ajoutees plus tard)
- INSERT, UPDATE, DELETE : admins uniquement

---

## 2. Nouveaux fichiers frontend

### 2.1 Page `src/pages/admin/AdminDocuments.tsx`

Meme structure que `AdminOfficers.tsx` :
- En-tete avec icone (FileText) et titre + bouton "Importer"
- Barre de recherche filtrant par nom d'affichage
- Table avec colonnes :

| Colonne | Contenu |
|---------|---------|
| Nom d'affichage | display_name |
| Type | Badge (Contrat / Facture / Autre) |
| Tags | Badges (depuis document_tag_assignments) |
| Date d'import | created_at formate DD/MM/YYYY |
| Actions | Edit (Pencil) + Delete (Trash2) |

Donnees chargees via react-query : fetch `documents`, fetch `document_tag_assignments` + `document_tags` pour resoudre les noms de tags.

### 2.2 Composant `src/components/admin/DocumentUploadDialog.tsx`

Modale d'import multi-fichiers :
- Input file (multiple)
- Pour chaque fichier selectionne :
  - Nom d'affichage (pre-rempli avec le nom du fichier sans extension)
  - Type de document (select : Contrat, Facture, Autre)
  - Tags (multi-select parmi les tags de la table `document_tags`)
- Bouton "Importer" :
  1. Upload chaque fichier vers le bucket `documents` sous le chemin `{uuid}_{filename}`
  2. Insert dans `documents`
  3. Insert les associations dans `document_tag_assignments`

### 2.3 Composant `src/components/admin/DocumentEditDialog.tsx`

Modale d'edition (similaire a `OfficerFormDialog`) :
- Champs editables : nom d'affichage, type de document, tags
- Le fichier original n'est pas modifiable
- Met a jour `documents` + synchronise `document_tag_assignments` (delete + re-insert)

### 2.4 Composant `src/components/admin/DeleteDocumentDialog.tsx`

Modale de confirmation simple :
- Affiche le nom du document
- Supprime du bucket via `supabase.storage.from('documents').remove([path])`
- Supprime de la table `documents` (cascade supprime les tag_assignments)

---

## 3. Integration

### 3.1 Route (`App.tsx`)

Ajouter dans le bloc admin : `<Route path="documents" element={<AdminDocuments />} />`

### 3.2 Sidebar (`AppSidebar.tsx`)

Ajouter un item "Documents" avec icone `FileText` dans la section admin, pointant vers `/admin/documents`

### 3.3 Dashboard admin (`AdminDashboard.tsx`)

Ajouter une carte "Documents" dans la grille

### 3.4 Traductions (`en.json`)

Ajouter les cles sous `sidebar.adminDocuments` et `admin.documents.*` :
- title, searchPlaceholder, import, edit, editDesc
- displayName, documentType, tags, uploadDate, actions, originalFile
- Types : contract, invoice, other
- Messages : saveSuccess, deleteSuccess, uploadSuccess, deleteConfirmTitle, deleteConfirmDesc, deleteConfirmButton, noDocuments

---

## 4. Resume des fichiers

| Fichier | Action |
|---------|--------|
| Migration SQL | Creer enum, tables `document_tags`, `documents`, `document_tag_assignments`, bucket, RLS, donnees par defaut |
| `src/pages/admin/AdminDocuments.tsx` | Creer |
| `src/components/admin/DocumentUploadDialog.tsx` | Creer |
| `src/components/admin/DocumentEditDialog.tsx` | Creer |
| `src/components/admin/DeleteDocumentDialog.tsx` | Creer |
| `src/App.tsx` | Ajouter route |
| `src/components/layout/AppSidebar.tsx` | Ajouter item sidebar |
| `src/pages/admin/AdminDashboard.tsx` | Ajouter carte |
| `src/i18n/locales/en.json` | Ajouter traductions |

---

## 5. Note sur l'architecture

La table `documents` ne contient volontairement ni `company_id` ni `officer_id`. Cette architecture est preparee pour que les liens d'acces soient ajoutes plus tard cote DB (par exemple via une table `document_links` polymorphique). Pour le moment, seuls les admins peuvent voir et gerer tous les documents. Quand les liens seront en place, il suffira d'adapter les politiques RLS de `documents` et du bucket sans modifier la structure de la table.

