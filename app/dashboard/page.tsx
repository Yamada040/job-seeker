import Image from "next/image";
import Link from "next/link";

import { Database } from "@/lib/database.types";
import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import SignOutButton from "./_components/sign-out-button";

type EsRow = Database["public"]["Tables"]["es_entries"]["Row"];
type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

const todayTasks = [
  "ESを1件ドラフトしてAI添削を依頼",
  "企業カードのステータスを2件更新",
  "直近の面接メモを整理",
  "気になる企業を1社お気に入りに追加",
];

const kpis = [
  { title: "ES", value: "下書き 3 / 提出 2", icon: "✏️" },
  { title: "企業分析", value: "今週: 4件", icon: "🏢" },
  { title: "選考状況", value: "面接 2 / 通過 1", icon: "🎯" },
  { title: "お気に入り", value: "5社", icon: "⭐" },
];

const fallbackEs: EsRow[] = [
  { id: "fallback-1", user_id: null, title: "SaaS PM summer internship", content_md: "", status: "draft", tags: ["SaaS"], score: 78, created_at: null, updated_at: null },
  { id: "fallback-2", user_id: null, title: "Marketing role at consumer app", content_md: "", status: "submitted", tags: ["Marketing"], score: 85, created_at: null, updated_at: null },
];

const fallbackCompanies: CompanyRow[] = [
  { id: "fallback-c1", user_id: null, name: "Alpha SaaS", url: "alphasaas.jp", memo: null, stage: "Screening", preference: 3, favorite: true, ai_summary: null, created_at: null, updated_at: null },
  { id: "fallback-c2", user_id: null, name: "Sky Finance", url: "skyfin.co.jp", memo: null, stage: "Document passed", preference: 3, favorite: false, ai_summary: null, created_at: null, updated_at: null },
];

const aiQueue = [
  { title: "Alpha SaaS 企業要約", provider: "Gemini", status: "実行中" },
  { title: "SaaS PM ES 添削", provider: "Gemini", status: "待機中" },
  { title: "Sky Finance 企業要約", provider: "Gemini", status: "完了" },
];

const FALLBACK_XP = 150;
const XP_NEXT_LEVEL = 180;

async function getDashboardData() {
  try {
    const supabase = await createSupabaseReadonlyClient();
    if (!supabase) {
      return { esEntries: fallbackEs, companies: fallbackCompanies, xp: FALLBACK_XP, user: null, profile: null, envReady: false };
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;

    const [esRes, companyRes, xpRes, profileRes] = await Promise.all([
      supabase.from("es_entries").select("*").order("updated_at", { ascending: false }).limit(5),
      supabase.from("companies").select("*").order("updated_at", { ascending: false }).limit(5),
      supabase.from("xp_logs").select("xp"),
      userId ? supabase.from("profiles").select("full_name,avatar_id,university,faculty").eq("id", userId).maybeSingle() : Promise.resolve({ data: null }),
    ]);

    const esEntries = esRes.data ?? fallbackEs;
    const companies = companyRes.data ?? fallbackCompanies;
    const xp = (xpRes.data ?? []).reduce((sum, row) => sum + (row.xp || 0), 0) || FALLBACK_XP;

    return {
      esEntries,
      companies,
      xp,
      user: userData?.user ?? null,
      profile: profileRes.data ?? null,
      envReady: true,
    };
  } catch (error) {
    console.error("dashboard data fetch error", error);
    return { esEntries: fallbackEs, companies: fallbackCompanies, xp: FALLBACK_XP, user: null, profile: null, envReady: false };
  }
}

export default async function DashboardPage() {
  const { esEntries, companies, xp, user, profile } = await getDashboardData();
  const isAuthed = Boolean(user);
  const avatarSrc = profile?.avatar_id ? `/avatars/${profile.avatar_id}.svg` : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,196,38,0.14),transparent_60%)] blur-2xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_40%,rgba(255,255,255,0.04)_100%)]" />
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 sm:px-10 sm:py-16">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">ダッシュボード</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AIとゲーミフィケーションで就活を前向きに</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-100/80">
              ESドラフト・企業分析・AIフィードバックを1か所に集約。XPで進捗を可視化し、毎週のモチベーションを維持します。
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-100/90">
              <span className="rounded-full bg-white/10 px-3 py-1">Supabase Auth + RLS</span>
              <span className="rounded-full bg-white/10 px-3 py-1">AI: Gemini / GPT 切替可</span>
              <span className="rounded-full bg-white/10 px-3 py-1">レベル & XP</span>
              {isAuthed ? (
                <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-emerald-100">{user?.email}</span>
              ) : (
                <span className="rounded-full bg-white/10 px-3 py-1 text-amber-100">ログインしてデータを同期</span>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm shadow-lg sm:max-w-sm">
            <div className="flex items-center gap-3">
              {avatarSrc ? (
                <Image src={avatarSrc} alt="avatar" width={56} height={56} className="h-14 w-14 rounded-2xl border border-white/10 object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-300 to-orange-500 text-lg font-bold text-slate-950 shadow-lg shadow-amber-500/40">
                  {user?.email ? user.email.slice(0, 2).toUpperCase() : "LV"}
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-slate-200/80">レベル進捗</p>
                <p className="text-sm font-semibold text-white">Lv.3 / {xp} XP</p>
                <p className="text-xs text-amber-100">次のレベルまで {Math.max(XP_NEXT_LEVEL - xp, 0)} XP</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-linear-to-r from-amber-400 to-rose-400" style={{ width: `${Math.min((xp / XP_NEXT_LEVEL) * 100, 100)}%` }} aria-hidden />
            </div>
          </div>
          {isAuthed ? <SignOutButton /> : null}
        </header>

        {!isAuthed ? (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            デモ表示中です。ログインすると保存・編集が有効になります。
          </div>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
              <div className="flex items-center justify-between text-sm font-semibold text-white">
                <span>{item.title}</span>
                <span className="text-base">{item.icon}</span>
              </div>
              <p className="mt-2 text-sm text-amber-100">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">今日のフォーカス</h2>
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-amber-100">{todayTasks.length} 件</span>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-100/85">
              {todayTasks.map((task) => (
                <li key={task} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-amber-300" aria-hidden />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">ESの最新状況</h2>
              <Link href="/es" className="rounded-full border border-white/20 px-3 py-1 text-xs text-white hover:bg-white/10">
                一覧を見る
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {esEntries.map((es) => (
                <div key={es.id} className="rounded-xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-white/0 p-4">
                  <p className="text-sm font-semibold text-white">{es.title}</p>
                  <p className="mt-2 text-xs text-slate-100/70">更新日: {es.updated_at ? new Date(es.updated_at).toLocaleDateString() : "-"}</p>
                  {es.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-amber-100">
                      {es.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/10 px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-100/85">
                    <span className="rounded-full bg-white/10 px-3 py-1 capitalize">{es.status}</span>
                    {es.score ? <span className="font-semibold text-amber-200">スコア {es.score}</span> : <span className="text-slate-100/60">スコア -</span>}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">最新の企業カード</h2>
              <Link href="/companies" className="rounded-full border border-white/20 px-3 py-1 text-xs text-white hover:bg-white/10">
                一覧を見る
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {companies.map((company) => (
                <div key={company.id} className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{company.name}</p>
                    <p className="text-xs text-slate-100/70">{company.url}</p>
                    <p className="mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] text-slate-100 capitalize">{company.stage}</p>
                  </div>
                  {company.favorite ? (
                    <span className="rounded-full bg-amber-300/90 px-2 py-1 text-[11px] font-semibold text-slate-950">推し</span>
                  ) : null}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">AIキュー</h2>
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-emerald-100">Gemini / GPT</span>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-100/85">
              {aiQueue.map((item) => (
                <li key={item.title} className="rounded-xl border border-white/10 bg-linear-to-br from-emerald-400/10 via-white/5 to-white/0 px-3 py-3">
                  <div className="flex items-center justify-between text-xs text-slate-100/80">
                    <span className="rounded-full bg-white/10 px-2 py-1">{item.provider}</span>
                    <span className="text-emerald-200">{item.status}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">プロフィール</h2>
              <p className="text-xs text-slate-200/80">基本情報を編集するとダッシュボードに即反映されます。</p>
            </div>
            <Link href="/profile" className="rounded-full border border-white/20 px-3 py-1 text-xs text-white hover:bg-white/10">
              編集する
            </Link>
          </div>
          <div className="mt-3 flex items-center gap-4">
            {avatarSrc ? (
              <Image src={avatarSrc} alt="avatar" width={64} height={64} className="h-16 w-16 rounded-2xl border border-white/10 object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 text-xs text-slate-200">Avatar</div>
            )}
            <div className="text-sm text-slate-200/85">
              <p>Email: {user?.email ?? "未ログイン"}</p>
              <p>名前: {profile?.full_name ?? "未設定"}</p>
              <p>
                大学 / 学部: {profile?.university ?? "未設定"} / {profile?.faculty ?? "未設定"}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
