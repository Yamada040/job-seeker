-- Supabase schema for MVP
-- Run via supabase SQL editor or psql. Ensure RLS is ON for all tables.

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
  title text not null,
  content_md text default '',
  status text default '下書き',
  tags text[] default array[]::text[],
  questions jsonb default '[]'::jsonb, -- [{id, prompt, answer_md}]
  score int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  url text,
  memo text,
  stage text default '未エントリー',
  preference int default 3, -- 1(high) to 5(low)
  favorite boolean default false,
  ai_summary jsonb, -- store AI analysis result
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.xp_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null, -- e.g., es_create, es_submit, company_analyze
  xp int not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.es_entries enable row level security;
alter table public.companies enable row level security;
alter table public.xp_logs enable row level security;

-- Policies: user can manage own rows
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'profiles_owner_rw'
  ) then
    create policy profiles_owner_rw on public.profiles
      for all using (auth.uid() = id) with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'es_entries_owner_rw'
  ) then
    create policy es_entries_owner_rw on public.es_entries
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'companies_owner_rw'
  ) then
    create policy companies_owner_rw on public.companies
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'xp_logs_owner_rw'
  ) then
    create policy xp_logs_owner_rw on public.xp_logs
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- Indexes for common filters
create index if not exists es_entries_user_idx on public.es_entries(user_id);
create index if not exists companies_user_idx on public.companies(user_id);
create index if not exists xp_logs_user_idx on public.xp_logs(user_id);
