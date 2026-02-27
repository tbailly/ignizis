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