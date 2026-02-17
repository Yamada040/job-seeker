-- issue36: 適性チェック / 自己分析を1ユーザー1レコードに制限

-- 既存データの重複を整理（最新 created_at, 同値なら id が大きい行を残す）
with ranked as (
  select
    id,
    user_id,
    row_number() over (
      partition by user_id
      order by created_at desc nulls last, id desc
    ) as rn
  from public.aptitude_results
  where user_id is not null
)
delete from public.aptitude_results ar
using ranked r
where ar.id = r.id
  and r.rn > 1;

with ranked as (
  select
    id,
    user_id,
    row_number() over (
      partition by user_id
      order by created_at desc nulls last, id desc
    ) as rn
  from public.self_analysis_results
  where user_id is not null
)
delete from public.self_analysis_results sr
using ranked r
where sr.id = r.id
  and r.rn > 1;

-- user_id ごとに1件だけ許可
create unique index if not exists aptitude_results_user_id_unique
  on public.aptitude_results (user_id)
  where user_id is not null;

create unique index if not exists self_analysis_results_user_id_unique
  on public.self_analysis_results (user_id)
  where user_id is not null;
