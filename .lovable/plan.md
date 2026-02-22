

## Documents : appartenance entreprise + page utilisateur "Contracts and Invoices"

### 1. Migration base de donnees

Ajouter une colonne `company_id` (nullable, FK vers `companies.id ON DELETE SET NULL`) a la table `documents`.

Ajouter une politique RLS SELECT pour les membres de l'entreprise :

```sql
ALTER TABLE public.documents
  ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

CREATE POLICY "Members can view company documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (company_id IS NOT NULL AND is_member_of_company(company_id));
```

### 2. Admin : colonne "Company" dans la table des documents

**Fichier : `src/pages/admin/AdminDocuments.tsx`**

- Ajouter `company_id` et `company_name` au `DocumentRow` interface
- Dans la query, faire un join sur `companies` pour recuperer le nom : `select('*, companies:company_id(name)')`
- Ajouter une colonne "Company" dans le tableau entre "Tags" et "Upload date", affichant le nom de l'entreprise ou "-"
- Mettre a jour les `colSpan` de 6 a 7

### 3. Admin : champ "Company" dans les dialogues d'edition et d'upload

**Fichier : `src/components/admin/DocumentEditDialog.tsx`**

- Ajouter un champ `company_id` a l'interface `DocumentData`
- Ajouter un state `companyId` initialise depuis `document.company_id`
- Charger la liste des entreprises via une query sur `companies` (id, name)
- Afficher un dropdown searchable (reutiliser le pattern Combobox/Popover existant comme dans `DocumentSelect`) avec :
  - Recherche par nom d'entreprise
  - Option pour effacer la selection (bouton X)
- Inclure `company_id` dans l'update

**Fichier : `src/components/admin/DocumentUploadDialog.tsx`**

- Ajouter `companyId` au `FileEntry` interface
- Ajouter le meme dropdown searchable dans chaque fiche de document
- Inclure `company_id` dans l'insert

### 4. Page utilisateur "Contrats" (My contracts and invoices)

**Fichier : `src/pages/Contrats.tsx`**

Remplacer le placeholder actuel par une page complete :

- Charger les documents lies a `currentCompany.company_id` via `supabase.from('documents').select('*').eq('company_id', companyId).order('created_at', { ascending: false })`
- Diviser en 2 sections avec des Card + CardHeader :
  - **Invoices** : filtrer `document_type === 'invoice'`
  - **Contracts** : filtrer `document_type === 'contract'`
- Chaque section affiche un tableau avec les colonnes : Display name, Upload date, Actions
- Actions :
  - Bouton Eye (preview PDF dans une modale avec iframe + URL signee) — visible uniquement si le document est un PDF
  - Bouton Download (URL signee avec nom d'origine) — toujours visible
- Si aucun document dans une section, afficher un message "No invoices" / "No contracts"

### 5. Traductions (en.json)

Nouvelles cles :

```json
"contracts": {
  "title": "My contracts and invoices",
  "invoices": "Invoices",
  "contracts": "Contracts",
  "noInvoices": "No invoices",
  "noContracts": "No contracts",
  "displayName": "Name",
  "uploadDate": "Upload date",
  "actions": "Actions"
}
```

Et pour l'admin :
```json
"admin.documents.company": "Company",
"admin.documents.noCompany": "No company",
"admin.documents.selectCompany": "Search and select a company..."
```

---

### Recapitulatif

| Element | Action |
|---------|--------|
| Migration SQL | +colonne `company_id` sur `documents`, +RLS policy lecture membres |
| `AdminDocuments.tsx` | +colonne "Company" dans le tableau |
| `DocumentEditDialog.tsx` | +dropdown searchable entreprise |
| `DocumentUploadDialog.tsx` | +dropdown searchable entreprise |
| `Contrats.tsx` | Page complete avec 2 sections (Invoices / Contracts) + preview PDF + download |
| `en.json` | +cles i18n |

