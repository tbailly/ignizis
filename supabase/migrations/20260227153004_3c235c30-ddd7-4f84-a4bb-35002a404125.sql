
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
