

## Propriete "compliant" calculee automatiquement pour les corporate officers

### 1. Migration base de donnees

Ajouter la colonne `is_compliant`, les fonctions de recalcul, et les triggers.

```sql
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
```

---

### 2. Edge function `recalculate-compliance`

Nouvelle edge function dans `supabase/functions/recalculate-compliance/index.ts` :
- Appelle `supabase.rpc('recalculate_all_officer_compliance')` avec le service role key
- `verify_jwt = false` dans `config.toml`

---

### 3. Cron quotidien

Insertion SQL (via insert tool, pas migration) pour programmer un job `pg_cron` a minuit qui appelle l'edge function via `pg_net`.

---

### 4. Modifications frontend

#### `src/pages/admin/AdminOfficers.tsx`

- Ajouter `is_compliant: boolean` a l'interface et au SELECT
- Ajouter une colonne "Status" dans le tableau avec un Badge :
  - Vert (`bg-green-100 text-green-800`) + texte "Compliant" si `true`
  - Rouge (`destructive`) + texte "Non-compliant" si `false`
- Mettre a jour les `colSpan` de 5 a 6

#### `src/i18n/locales/en.json`

Nouvelles cles :
- `"admin.officers.status"` : `"Status"`
- `"admin.officers.compliant"` : `"Compliant"`
- `"admin.officers.nonCompliant"` : `"Non-compliant"`

La colonne `is_compliant` n'est **pas** exposee dans le formulaire d'edition (`OfficerFormDialog`) — elle est en lecture seule, calculee uniquement par les triggers et le cron.

---

### Recapitulatif

| Fichier | Action |
|---------|--------|
| Migration SQL | +colonne `is_compliant`, +fonctions recalcul, +triggers sur `company_officers` et `documents` |
| `supabase/functions/recalculate-compliance/index.ts` | Edge function pour le cron quotidien |
| `supabase/config.toml` | +config pour l'edge function |
| Cron SQL (insert tool) | Job `pg_cron` quotidien |
| `AdminOfficers.tsx` | +colonne "Status" lecture seule avec Badge |
| `en.json` | +cles i18n compliance |

