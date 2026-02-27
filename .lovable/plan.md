

## Architecture Soft Delete

### Approche : colonne `deleted_at` + vues PostgreSQL

Ajouter une colonne `deleted_at timestamptz NULL DEFAULT NULL` sur les 5 tables. Creer une vue PostgreSQL pour chaque table (prefixee `active_`) qui filtre automatiquement `WHERE deleted_at IS NULL`. Cote frontend, remplacer les appels `.delete()` par des `.update({ deleted_at: new Date().toISOString() })`.

**Pourquoi des vues ?** Cela centralise le filtrage en base et evite d'ajouter `.is('deleted_at', null)` sur chaque requete frontend. Les vues sont aussi compatibles avec les jointures et les politiques RLS existantes.

### Migration SQL

```sql
-- Ajouter deleted_at sur les 5 tables
ALTER TABLE documents ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE companies ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE company_officers ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE document_tags ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE requests ADD COLUMN deleted_at timestamptz DEFAULT NULL;

-- Creer des vues "active" pour chaque table
CREATE VIEW active_documents AS SELECT * FROM documents WHERE deleted_at IS NULL;
CREATE VIEW active_companies AS SELECT * FROM companies WHERE deleted_at IS NULL;
CREATE VIEW active_company_officers AS SELECT * FROM company_officers WHERE deleted_at IS NULL;
CREATE VIEW active_document_tags AS SELECT * FROM document_tags WHERE deleted_at IS NULL;
CREATE VIEW active_requests AS SELECT * FROM requests WHERE deleted_at IS NULL;
```

### Modifications frontend

#### 1. Toutes les requetes SELECT

Remplacer `.from('table')` par `.from('active_table')` dans tous les selects :

| Table originale | Vue active | Fichiers concernes |
|---|---|---|
| `documents` | `active_documents` | `AdminDocuments.tsx`, `DocumentsSection.tsx`, `Contrats.tsx`, `OfficerFormDialog.tsx`, `DocumentUploadDialog.tsx`, `DocumentEditDialog.tsx` |
| `companies` | `active_companies` | `AdminCompanies.tsx`, `AdminRequests.tsx`, `CompanyFormDialog.tsx`, `DocumentUploadDialog.tsx`, `DocumentEditDialog.tsx`, `OfficerFormDialog.tsx`, `CompanyContext.tsx` |
| `company_officers` | `active_company_officers` | `AdminOfficers.tsx`, `CompanyFormDialog.tsx`, `DocumentUploadDialog.tsx` |
| `document_tags` | `active_document_tags` | `TagManagementDialog.tsx`, `DocumentUploadDialog.tsx`, `DocumentEditDialog.tsx`, `AdminDocuments.tsx` |
| `requests` | `active_requests` | `AdminRequests.tsx`, `Juridique.tsx`, `KanbanBoard.tsx`, `RequestFormDialog.tsx` |

Les INSERT/UPDATE/DELETE restent sur les tables originales.

#### 2. Actions de suppression → soft delete

Remplacer `.delete().eq('id', id)` par `.update({ deleted_at: new Date().toISOString() }).eq('id', id)` dans :

| Fichier | Action |
|---|---|
| `DeleteCompanyDialog.tsx` | `.from('companies').update(...)` |
| `DeleteDocumentDialog.tsx` | `.from('documents').update(...)` (supprimer l'appel storage.remove) |
| `DeleteOfficerDialog.tsx` | `.from('company_officers').update(...)` |
| `TagManagementDialog.tsx` | `.from('document_tags').update(...)` |
| `AdminRequests.tsx` handleDelete | `.from('requests').update(...)` |

#### 3. Documents : conserver le fichier storage

Dans `DeleteDocumentDialog.tsx`, supprimer l'appel `supabase.storage.from('documents').remove(...)` car le fichier doit rester accessible si on restaure un jour le document.

#### 4. Relations a filtrer

- `officer_company_assignments` : pas de soft delete (table de liaison), mais les requetes qui joignent `company_officers` ou `companies` utiliseront les vues actives
- `document_tag_assignments` : idem, pas de soft delete mais les jointures avec `document_tags` ou `documents` utiliseront les vues actives
- `Entreprise.tsx` : la page company affiche les officers via `officer_company_assignments` -- les officers soft-deleted ne seront plus visibles car la requete sur `active_company_officers` les exclura

### Resume

| Etape | Scope |
|---|---|
| 1 migration SQL | 5 colonnes `deleted_at` + 5 vues |
| ~15 fichiers frontend | Remplacer `.from('table')` par `.from('active_table')` pour les SELECT |
| 5 fichiers frontend | Remplacer `.delete()` par `.update({ deleted_at })` |
| 1 fichier | Supprimer l'appel storage.remove dans DeleteDocumentDialog |

