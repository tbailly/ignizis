
-- Colonne
ALTER TABLE public.company_officers
  ADD COLUMN is_compliant boolean NOT NULL DEFAULT false;

-- Fonction unitaire
CREATE OR REPLACE FUNCTION public.recalculate_officer_compliance(p_officer_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_compliant boolean;
BEGIN
  SELECT (
    o.passport_document_id IS NOT NULL
    AND o.secondary_id_document_id IS NOT NULL
    AND o.power_of_attorney_document_id IS NOT NULL
    AND d1.expires_at IS NOT NULL AND d1.expires_at > CURRENT_DATE
    AND d2.expires_at IS NOT NULL AND d2.expires_at > CURRENT_DATE
    AND d3.expires_at IS NOT NULL AND d3.expires_at > CURRENT_DATE
  ) INTO v_compliant
  FROM company_officers o
  LEFT JOIN documents d1 ON d1.id = o.passport_document_id
  LEFT JOIN documents d2 ON d2.id = o.secondary_id_document_id
  LEFT JOIN documents d3 ON d3.id = o.power_of_attorney_document_id
  WHERE o.id = p_officer_id;

  UPDATE company_officers SET is_compliant = COALESCE(v_compliant, false) WHERE id = p_officer_id;
END;
$$;

-- Fonction batch (pour le cron)
CREATE OR REPLACE FUNCTION public.recalculate_all_officer_compliance()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM company_officers LOOP
    PERFORM recalculate_officer_compliance(r.id);
  END LOOP;
END;
$$;

-- Trigger sur company_officers (changement de document links)
CREATE OR REPLACE FUNCTION public.trg_officer_compliance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  PERFORM recalculate_officer_compliance(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER officer_compliance_trigger
  AFTER INSERT OR UPDATE OF passport_document_id, secondary_id_document_id, power_of_attorney_document_id
  ON public.company_officers
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_officer_compliance();

-- Trigger sur documents (changement de expires_at)
CREATE OR REPLACE FUNCTION public.trg_document_compliance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id FROM company_officers
    WHERE passport_document_id = NEW.id
       OR secondary_id_document_id = NEW.id
       OR power_of_attorney_document_id = NEW.id
  LOOP
    PERFORM recalculate_officer_compliance(r.id);
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER document_compliance_trigger
  AFTER UPDATE OF expires_at
  ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_document_compliance();

-- Recalculer pour les donnees existantes
SELECT recalculate_all_officer_compliance();
