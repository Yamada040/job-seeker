-- issue#111: AIエンドポイントのレート制限をサーバーレス環境でも一貫させるため、
-- これまでのin-memory Mapから永続化テーブルへ移行する。

create table if not exists public.api_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  window_start timestamptz not null default now(),
  count integer not null default 0,
  primary key (user_id, bucket)
);

alter table public.api_rate_limits enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='api_rate_limits' and policyname='Enable read own rate limits'
  ) then
    create policy "Enable read own rate limits" on public.api_rate_limits for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='api_rate_limits' and policyname='Enable insert own rate limits'
  ) then
    create policy "Enable insert own rate limits" on public.api_rate_limits for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='api_rate_limits' and policyname='Enable update own rate limits'
  ) then
    create policy "Enable update own rate limits" on public.api_rate_limits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end$$;
