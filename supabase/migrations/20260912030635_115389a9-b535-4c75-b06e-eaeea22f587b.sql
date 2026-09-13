create or replace function public.watch_upcoming_sessions()
returns table (
  id uuid,
  scheduled_start timestamptz,
  duration_seconds integer,
  technical_difficulty boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.scheduled_start, s.duration_seconds, s.technical_difficulty
  from public.watch_sessions s
  where s.scheduled_start > now()
     or (s.duration_seconds is not null
         and now() < s.scheduled_start + make_interval(secs => s.duration_seconds))
  order by s.scheduled_start asc
  limit 12
$$;

revoke all on function public.watch_upcoming_sessions() from public, anon, authenticated;
grant execute on function public.watch_upcoming_sessions() to service_role;

alter table public.watch_sessions replica identity full;
alter publication supabase_realtime add table public.watch_sessions;