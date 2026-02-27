

## Cascade soft-delete d'une entreprise : documents + requests

### Approche : fonction PostgreSQL transactionnelle

Creer une fonction `soft_delete_company(p_company_id uuid)` qui effectue les 3 updates dans une seule transaction. Appeler cette fonction via `supabase.rpc()` depuis le frontend.

### 1. Migration SQL — Fonction `soft_delete_company`

```sql
CREATE OR REPLACE FUNCTION public.soft_delete_company(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_now timestamptz := now();
BEGIN
  UPDATE companies SET deleted_at = v_now WHERE id = p_company_id AND deleted_at IS NULL;
  UPDATE documents SET deleted_at = v_now WHERE company_id = p_company_id AND deleted_at IS NULL;
  UPDATE requests  SET deleted_at = v_now WHERE company_id = p_company_id AND deleted_at IS NULL;
END;
$$;
```

Etant `SECURITY DEFINER`, la fonction bypass RLS. Pas besoin de politique supplementaire. La transaction est implicite (une fonction PL/pgSQL = 1 transaction).

### 2. `DeleteCompanyDialog.tsx` — Appeler `rpc('soft_delete_company')`

Remplacer le `.from('companies').update(...)` (lignes 30-33) par :

```ts
const { error } = await supabase.rpc('soft_delete_company' as any, {
  p_company_id: company.id,
});
```

### Resume

| Fichier | Modification |
|---------|-------------|
| Migration SQL | Fonction `soft_delete_company` (transaction implicite) |
| `DeleteCompanyDialog.tsx` | `supabase.rpc('soft_delete_company', ...)` |

