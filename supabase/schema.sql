-- Supabase schema for MVP
-- Run via Supabase SQL editor or psql. RLS is enabled on all tables.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  university text,
  faculty text,
  avatar_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.es_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  company_name text,
  selection_status text,
  company_url text,
  memo text,
  status text default 'draft',
  content_md text,
  questions jsonb,
  tags text[] default '{}',
  score numeric,
  ai_summary text,
  deadline date,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  company text,
  type text default 'other',
  date date not null,
  time text,
  created_at timestamptz default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  url text,
  mypage_id text,
  mypage_url text,
  memo text,
  stage text,
  preference integer,
  favorite boolean default false,
  ai_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.xp_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  xp integer,
  created_at timestamptz default now()
);

create table if not exists public.aptitude_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  answers jsonb not null,
  ai_summary text,
  created_at timestamptz default now()
);

create table if not exists public.self_analysis_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  answers jsonb not null,
  ai_summary text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.es_entries enable row level security;
alter table public.calendar_events enable row level security;
alter table public.companies enable row level security;
alter table public.xp_logs enable row level security;
alter table public.aptitude_results enable row level security;
alter table public.self_analysis_results enable row level security;

do $$
begin
  -- profiles
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Enable read own profile'
  ) then
    create policy "Enable read own profile" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Enable update own profile'
  ) then
    create policy "Enable update own profile" on public.profiles for update using (auth.uid() = id);
  end if;

  -- es_entries
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='es_entries' and policyname='Enable read own es'
  ) then
    create policy "Enable read own es" on public.es_entries for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='es_entries' and policyname='Enable insert own es'
  ) then
    create policy "Enable insert own es" on public.es_entries for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='es_entries' and policyname='Enable update own es'
  ) then
    create policy "Enable update own es" on public.es_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='es_entries' and policyname='Enable delete own es'
  ) then
    create policy "Enable delete own es" on public.es_entries for delete using (auth.uid() = user_id);
  end if;

  -- calendar_events
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='calendar_events' and policyname='Enable read own calendar events'
  ) then
    create policy "Enable read own calendar events" on public.calendar_events for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='calendar_events' and policyname='Enable insert own calendar events'
  ) then
    create policy "Enable insert own calendar events" on public.calendar_events for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='calendar_events' and policyname='Enable update own calendar events'
  ) then
    create policy "Enable update own calendar events" on public.calendar_events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='calendar_events' and policyname='Enable delete own calendar events'
  ) then
    create policy "Enable delete own calendar events" on public.calendar_events for delete using (auth.uid() = user_id);
  end if;

  -- companies
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='companies' and policyname='Enable read own company'
  ) then
    create policy "Enable read own company" on public.companies for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='companies' and policyname='Enable insert own company'
  ) then
    create policy "Enable insert own company" on public.companies for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='companies' and policyname='Enable update own company'
  ) then
    create policy "Enable update own company" on public.companies for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='companies' and policyname='Enable delete own company'
  ) then
    create policy "Enable delete own company" on public.companies for delete using (auth.uid() = user_id);
  end if;

  -- xp_logs
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='xp_logs' and policyname='Enable read own xp'
  ) then
    create policy "Enable read own xp" on public.xp_logs for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='xp_logs' and policyname='Enable insert own xp'
  ) then
    create policy "Enable insert own xp" on public.xp_logs for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='xp_logs' and policyname='Enable update own xp'
  ) then
    create policy "Enable update own xp" on public.xp_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='xp_logs' and policyname='Enable delete own xp'
  ) then
    create policy "Enable delete own xp" on public.xp_logs for delete using (auth.uid() = user_id);
  end if;

  -- aptitude_results
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='aptitude_results' and policyname='Enable read own aptitude'
  ) then
    create policy "Enable read own aptitude" on public.aptitude_results for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='aptitude_results' and policyname='Enable insert own aptitude'
  ) then
    create policy "Enable insert own aptitude" on public.aptitude_results for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='aptitude_results' and policyname='Enable update own aptitude'
  ) then
    create policy "Enable update own aptitude" on public.aptitude_results for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='aptitude_results' and policyname='Enable delete own aptitude'
  ) then
    create policy "Enable delete own aptitude" on public.aptitude_results for delete using (auth.uid() = user_id);
  end if;

  -- self_analysis_results
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='self_analysis_results' and policyname='Enable read own self analysis'
  ) then
    create policy "Enable read own self analysis" on public.self_analysis_results for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='self_analysis_results' and policyname='Enable insert own self analysis'
  ) then
    create policy "Enable insert own self analysis" on public.self_analysis_results for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='self_analysis_results' and policyname='Enable update own self analysis'
  ) then
    create policy "Enable update own self analysis" on public.self_analysis_results for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='self_analysis_results' and policyname='Enable delete own self analysis'
  ) then
    create policy "Enable delete own self analysis" on public.self_analysis_results for delete using (auth.uid() = user_id);
  end if;
end$$;
