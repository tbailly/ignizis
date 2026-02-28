
-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Table notification_queue
CREATE TABLE public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_attempt_at timestamptz
);

-- RLS admin only
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notification queue"
  ON public.notification_queue
  FOR ALL
  USING (is_admin(auth.uid()));

-- Trigger function: insert queue entry + call edge function via pg_net
CREATE OR REPLACE FUNCTION public.notify_new_request_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_queue_id uuid;
  v_company_name text;
  v_url text;
  v_key text;
BEGIN
  -- Insert queue entry (transactional, guaranteed)
  INSERT INTO notification_queue (request_id)
  VALUES (NEW.id) RETURNING id INTO v_queue_id;

  -- Get company name
  SELECT name INTO v_company_name FROM companies WHERE id = NEW.company_id;

  -- Get secrets from vault
  v_url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1);
  v_key := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1);

  -- Fire-and-forget HTTP call via pg_net
  IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_url || '/functions/v1/notify-new-request',
      body := jsonb_build_object(
        'queue_id', v_queue_id,
        'request_number', NEW.request_number,
        'title', NEW.title,
        'description', NEW.description,
        'company_name', COALESCE(v_company_name, ''),
        'requester_email', NEW.requester_email
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_key
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trg_notify_new_request
  AFTER INSERT ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_request_trigger();
