CREATE OR REPLACE FUNCTION public.watch_resolve_session()
RETURNS TABLE (
  id uuid,
  scheduled_start timestamptz,
  duration_seconds integer,
  bunny_video_id text,
  technical_difficulty boolean,
  next_class_focus text,
  is_live boolean,
  elapsed_seconds integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH live AS (
    SELECT s.id, s.scheduled_start, s.duration_seconds, s.bunny_video_id,
           s.technical_difficulty, s.next_class_focus, true AS is_live,
           floor(extract(epoch FROM (now() - s.scheduled_start)))::int AS elapsed_seconds
    FROM public.watch_sessions s
    WHERE s.duration_seconds IS NOT NULL
      AND now() >= s.scheduled_start
      AND now() <= s.scheduled_start + make_interval(secs => s.duration_seconds)
    ORDER BY s.scheduled_start DESC
    LIMIT 1
  ), upcoming AS (
    SELECT s.id, s.scheduled_start, s.duration_seconds, s.bunny_video_id,
           s.technical_difficulty, s.next_class_focus, false AS is_live,
           NULL::int AS elapsed_seconds
    FROM public.watch_sessions s
    WHERE s.scheduled_start > now()
    ORDER BY s.scheduled_start ASC
    LIMIT 1
  )
  SELECT * FROM live
  UNION ALL
  SELECT * FROM upcoming WHERE NOT EXISTS (SELECT 1 FROM live)
$$;

CREATE OR REPLACE FUNCTION public.watch_next_session()
RETURNS TABLE (
  id uuid,
  scheduled_start timestamptz,
  next_class_focus text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.scheduled_start, s.next_class_focus
  FROM public.watch_sessions s
  WHERE s.scheduled_start > now()
  ORDER BY s.scheduled_start ASC
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.watch_resolve_session() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.watch_next_session() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.watch_resolve_session() TO service_role;
GRANT EXECUTE ON FUNCTION public.watch_next_session() TO service_role;