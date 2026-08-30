CREATE OR REPLACE FUNCTION public.sync_instructor_application_to_sheet()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  hook_url    text := 'https://project--0a671550-db43-4f29-bf05-22fe8e222418.lovable.app/api/public/hooks/sync-instructor-application';
  hook_secret text := '12345';
  payload jsonb;
begin
  payload := jsonb_build_object(
    'secret', hook_secret,
    'record', jsonb_build_object(
      'id', new.id::text,
      'name', new.name,
      'social', new.social,
      'whatsapp', new.whatsapp,
      'email', new.email,
      'skill', new.skill,
      'availability', new.availability,
      'created_at', to_char(new.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )
  );
  perform net.http_post(
    url := hook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );
  return new;
end; $function$;