
CREATE OR REPLACE FUNCTION public.notify_new_request_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_queue_id uuid;
  v_company_name text;
BEGIN
  -- Insert queue entry (transactional, guaranteed)
  INSERT INTO notification_queue (request_id)
  VALUES (NEW.id) RETURNING id INTO v_queue_id;

  -- Get company name
  SELECT name INTO v_company_name FROM companies WHERE id = NEW.company_id;

  -- Fire-and-forget HTTP call via pg_net
  PERFORM net.http_post(
    url := 'https://epcelmrwfqniycdrxaoi.supabase.co/functions/v1/notify-new-request',
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
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwY2VsbXJ3ZnFuaXljZHJ4YW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4OTUyMjgsImV4cCI6MjA4NTQ3MTIyOH0.CdWZeYCrV4aBEssAoDus3Qs4rKMZRZQpRz6hdqdvpMY'
    )
  );

  RETURN NEW;
END;
$function$;
