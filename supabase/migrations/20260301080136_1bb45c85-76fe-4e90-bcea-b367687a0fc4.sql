
DROP VIEW IF EXISTS active_companies;
CREATE VIEW active_companies AS
SELECT id, name, slug, status, company_number, address, country,
       perm_legal, perm_accounting, perm_finance, accounting_software_url,
       compliant_until, created_at, updated_at, deleted_at
FROM companies
WHERE deleted_at IS NULL;
