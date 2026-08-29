CREATE TABLE public.rate_limit_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket TEXT NOT NULL,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rate_limit_events_lookup ON public.rate_limit_events (bucket, key, created_at DESC);
GRANT ALL ON public.rate_limit_events TO service_role;
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.sync_instructor_application_to_sheet()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  hook_url    text := 'https://project--0a671550-db43-4f29-bf05-22fe8e222418.lovable.app/api/public/hooks/sync-instructor-application';
  hook_secret text := '56c5a67a2939c76f3f996710dfdeb04fd9c8393528d0be40bbf06339c4443eb8';
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

REVOKE ALL ON FUNCTION public.sync_instructor_application_to_sheet() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_instructor_application_to_sheet() FROM anon, authenticated;