
-- 1. Drop view first (depends on is_compliant column)
DROP VIEW IF EXISTS public.active_company_officers;

-- 2. Drop old triggers
DROP TRIGGER IF EXISTS officer_compliance_trigger ON public.company_officers;
DROP TRIGGER IF EXISTS document_compliance_trigger ON public.documents;
DROP TRIGGER IF EXISTS trg_officer_compliance ON public.company_officers;
DROP TRIGGER IF EXISTS trg_document_compliance ON public.documents;

-- 3. Drop old functions with CASCADE
DROP FUNCTION IF EXISTS public.trg_officer_compliance() CASCADE;
DROP FUNCTION IF EXISTS public.trg_document_compliance() CASCADE;
DROP FUNCTION IF EXISTS public.recalculate_officer_compliance(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.recalculate_all_officer_compliance() CASCADE;

-- 4. Add compliant_until, drop is_compliant
ALTER TABLE public.company_officers ADD COLUMN compliant_until date DEFAULT NULL;
ALTER TABLE public.company_officers DROP COLUMN is_compliant;

-- 5. Recreate view with compliant_until
CREATE VIEW public.active_company_officers AS
SELECT id, first_name, last_name, date_of_birth, birth_city, position,
       compliant_until, passport_document_id, secondary_id_document_id,
       power_of_attorney_document_id, created_at, deleted_at
FROM public.company_officers
WHERE deleted_at IS NULL;

-- 6. Create new recalculate function
CREATE OR REPLACE FUNCTION public.recalculate_officer_compliant_until(p_officer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_d1 date;
  v_d2 date;
  v_d3 date;
  v_result date;
BEGIN
  SELECT d1.expires_at, d2.expires_at, d3.expires_at
  INTO v_d1, v_d2, v_d3
  FROM company_officers o
  LEFT JOIN documents d1 ON d1.id = o.passport_document_id
  LEFT JOIN documents d2 ON d2.id = o.secondary_id_document_id
  LEFT JOIN documents d3 ON d3.id = o.power_of_attorney_document_id
  WHERE o.id = p_officer_id;

  IF v_d1 IS NOT NULL AND v_d2 IS NOT NULL AND v_d3 IS NOT NULL THEN
    v_result := LEAST(v_d1, v_d2, v_d3);
  ELSE
    v_result := NULL;
  END IF;

  UPDATE company_officers SET compliant_until = v_result WHERE id = p_officer_id;
END;
$$;

-- 7. Trigger on company_officers when document IDs change
CREATE OR REPLACE FUNCTION public.trg_officer_compliant_until()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM recalculate_officer_compliant_until(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_officer_compliant_until
AFTER INSERT OR UPDATE OF passport_document_id, secondary_id_document_id, power_of_attorney_document_id
ON public.company_officers
FOR EACH ROW
EXECUTE FUNCTION public.trg_officer_compliant_until();

-- 8. Trigger on documents when expires_at changes
CREATE OR REPLACE FUNCTION public.trg_document_compliant_until()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id FROM company_officers
    WHERE passport_document_id = NEW.id
       OR secondary_id_document_id = NEW.id
       OR power_of_attorney_document_id = NEW.id
  LOOP
    PERFORM recalculate_officer_compliant_until(r.id);
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_document_compliant_until
AFTER UPDATE OF expires_at
ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.trg_document_compliant_until();

-- 9. Seed compliant_until for existing officers
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM company_officers LOOP
    PERFORM recalculate_officer_compliant_until(r.id);
  END LOOP;
END;
$$;
