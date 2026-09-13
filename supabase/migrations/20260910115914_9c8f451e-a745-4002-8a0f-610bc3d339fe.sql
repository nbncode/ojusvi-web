create table public.watch_sessions (
  id uuid primary key default gen_random_uuid(),
  scheduled_start timestamptz not null,
  duration_seconds integer,
  bunny_video_id text not null,
  technical_difficulty boolean not null default false,
  next_class_focus text,
  created_at timestamptz not null default now()
);

create or replace function public.watch_sessions_no_overlap()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.duration_seconds is null then
    return new;
  end if;
  if exists (
    select 1 from public.watch_sessions s
    where s.id <> new.id
      and s.duration_seconds is not null
      and tstzrange(new.scheduled_start, new.scheduled_start + (interval '1 second' * new.duration_seconds))
          && tstzrange(s.scheduled_start, s.scheduled_start + (interval '1 second' * s.duration_seconds))
  ) then
    raise exception 'watch session time window overlaps an existing session';
  end if;
  return new;
end;
$$;

create trigger trg_watch_sessions_no_overlap
before insert or update of scheduled_start, duration_seconds on public.watch_sessions
for each row execute function public.watch_sessions_no_overlap();

create table public.watch_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.watch_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now()
);

create table public.watch_popups (
  id uuid primary key default gen_random_uuid(),
  title text,
  body text,
  media_url text,
  active_from timestamptz,
  active_to timestamptz,
  created_at timestamptz not null default now()
);

create table public.watch_failures (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.watch_sessions(id) on delete cascade,
  flagged_at timestamptz not null default now()
);

create index watch_attendance_user_idx on public.watch_attendance(user_id);
create index watch_attendance_session_idx on public.watch_attendance(session_id);
create index watch_failures_session_idx on public.watch_failures(session_id);

grant select on public.watch_sessions to authenticated;
grant all on public.watch_sessions to service_role;
grant select on public.watch_attendance to authenticated;
grant all on public.watch_attendance to service_role;
grant select on public.watch_popups to authenticated;
grant all on public.watch_popups to service_role;
grant all on public.watch_failures to service_role;

alter table public.watch_sessions enable row level security;
alter table public.watch_attendance enable row level security;
alter table public.watch_popups enable row level security;
alter table public.watch_failures enable row level security;

create policy "Authenticated users can read watch sessions"
  on public.watch_sessions for select to authenticated using (true);

create policy "Authenticated users can read watch popups"
  on public.watch_popups for select to authenticated using (true);

create policy "Users can read their own watch attendance"
  on public.watch_attendance for select to authenticated using (auth.uid() = user_id);

create or replace function public.log_watch_failure()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.technical_difficulty = false and new.technical_difficulty = true then
    insert into public.watch_failures (session_id) values (new.id);
  end if;
  return new;
end;
$$;

create trigger trg_log_watch_failure
after update of technical_difficulty on public.watch_sessions
for each row execute function public.log_watch_failure();