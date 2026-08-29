-- Enable pg_net for async HTTP from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Trigger function: posts the new row to the sync hook
CREATE OR REPLACE FUNCTION public.sync_instructor_application_to_sheet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  hook_url text := 'https://project--4a323bae-13ab-44a7-90f5-de5c9fdceb2e.lovable.app/api/public/hooks/sync-instructor-application';
  hook_secret text := '12345';
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'secret', hook_secret,
    'record', jsonb_build_object(
      'id', NEW.id::text,
      'name', NEW.name,
      'social', NEW.social,
      'whatsapp', NEW.whatsapp,
      'email', NEW.email,
      'skill', NEW.skill,
      'availability', NEW.availability,
      'created_at', to_char(NEW.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )
  );

  PERFORM net.http_post(
    url := hook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_instructor_application_to_sheet ON public.instructor_applications;

CREATE TRIGGER trg_sync_instructor_application_to_sheet
AFTER INSERT ON public.instructor_applications
FOR EACH ROW
EXECUTE FUNCTION public.sync_instructor_application_to_sheet();

-- Lock down execution: only the function owner / postgres can call it directly.
-- The trigger context still works because triggers run as the table owner.
REVOKE ALL ON FUNCTION public.sync_instructor_application_to_sheet() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_instructor_application_to_sheet() FROM anon, authenticated;