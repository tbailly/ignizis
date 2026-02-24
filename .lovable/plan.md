

## Ajouter une section Documents sur la page Entreprise

### Vue d'ensemble

Ajouter une nouvelle Card "Documents" sous les cartes existantes (details + mandataires) sur la page `/company`. Cette section affiche tous les documents lies a l'entreprise active dans une datatable avec colonnes : nom, tags, date d'upload, actions (preview PDF + download). Les documents sont tries par date d'ajout descendante.

### Modifications

#### 1. `src/pages/Entreprise.tsx`

- Importer les composants necessaires : `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`, `Button`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Badge`, `Eye`, `Download`, `FileText`
- Ajouter un `useQuery` pour charger les documents de l'entreprise active (meme requete que dans `Contrats.tsx` mais sans filtre par type, et en incluant les tags via une jointure)
- Requete documents :
  ```
  supabase.from('documents')
    .select('id, display_name, document_type, storage_path, original_filename, mime_type, created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  ```
- Requete tags (separee, via `document_tag_assignments`) :
  ```
  supabase.from('document_tag_assignments')
    .select('document_id, document_tags(name)')
    .in('document_id', documentIds)
  ```
- Ajouter les fonctions `handlePreview` et `handleDownload` (identiques a `Contrats.tsx`)
- Ajouter une Card "Documents" apres la grille existante, contenant un `Table` avec 4 colonnes :
  - **Name** : `display_name`
  - **Tags** : badges avec les noms des tags associes
  - **Upload date** : date formatee
  - **Actions** : boutons Eye (preview PDF uniquement) et Download
- Ajouter le Dialog de preview PDF (identique a `Contrats.tsx`)
- Etat vide : message "No documents" si la liste est vide

#### 2. `src/i18n/locales/en.json`

Ajouter les cles de traduction dans la section `company` :

```json
"company": {
  ...existing keys...,
  "documents": "Documents",
  "noDocuments": "No documents",
  "documentName": "Name",
  "documentTags": "Tags",
  "documentUploadDate": "Upload date",
  "documentActions": "Actions",
  "documentPreview": "Preview",
  "documentDownload": "Download"
}
```

### Details techniques

- Les policies RLS existantes (`Members can view company documents`) autorisent deja les utilisateurs a voir les documents de leur entreprise
- Les tags sont charges via `document_tag_assignments` qui a une policy `Admins can select tag assignments` -- il faudra verifier si les utilisateurs non-admin peuvent voir les tags. Si non, on ajoutera une policy RLS `SELECT` pour les membres sur `document_tag_assignments` (condition : le document appartient a une entreprise dont l'utilisateur est membre)
- Le composant `Badge` existant sera utilise pour afficher les tags
- Pas de nouvelle dependance requise

### Migration SQL (si necessaire)

Ajouter une policy RLS sur `document_tag_assignments` pour permettre aux membres de voir les tags des documents de leur entreprise :

```sql
CREATE POLICY "Members can view tag assignments for company documents"
  ON document_tag_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_tag_assignments.document_id
        AND d.company_id IS NOT NULL
        AND public.is_member_of_company(d.company_id)
    )
  );
```

Meme chose pour `document_tags` -- la policy existante `Authenticated users can view tags` couvre deja le SELECT, donc pas de changement necessaire.

### Resume

| Fichier | Action |
|---------|--------|
| `src/pages/Entreprise.tsx` | Ajouter section Documents avec datatable (nom, tags, date, actions) |
| `src/i18n/locales/en.json` | Ajouter cles de traduction pour la section documents |
| Migration SQL | Ajouter policy RLS SELECT sur `document_tag_assignments` pour les membres |
