import Image from "next/image";
import Link from "next/link";
import {
  DocumentTextIcon,
  BuildingOfficeIcon,
  StarIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  BoltIcon
} from "@heroicons/react/24/outline";

import { Database } from "@/lib/database.types";
import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import { AppLayout } from "@/app/_components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/app/_components/ui";
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
  { title: "ES", value: "下書き3 / 提出2", icon: "✏️" },
  { title: "企業分析", value: "今週: 4件", icon: "🏢" },
  { title: "選考状況", value: "面接 2 / 通過 1", icon: "🎯" },
  { title: "お気に入り", value: "5社", icon: "⭐" },
];

const fallbackEs: EsRow[] = [
  { id: "fallback-1", user_id: null, title: "SaaS PM サマーインターン ES", content_md: "", questions: null, status: "draft", tags: ["SaaS"], score: 78, created_at: null, updated_at: null },
  { id: "fallback-2", user_id: null, title: "マーケ職向け ES", content_md: "", questions: null, status: "submitted", tags: ["Marketing"], score: 85, created_at: null, updated_at: null },
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
      return { esEntries: fallbackEs, companies: fallbackCompanies, xp: FALLBACK_XP, user: null, profile: null };
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
    };
  } catch (error) {
    console.error("dashboard data fetch error", error);
    return { esEntries: fallbackEs, companies: fallbackCompanies, xp: FALLBACK_XP, user: null, profile: null };
  }
}

export default async function DashboardPage() {
  const { esEntries, companies, xp, user, profile } = await getDashboardData();
  const isAuthed = Boolean(user);
  const avatarSrc = profile?.avatar_id ? `/avatars/${profile.avatar_id}.svg` : null;

  const headerActions = (
    <div className="flex gap-3">
      <Link href="/es/new" className="mvp-button mvp-button-primary">
        <PlusIcon className="h-4 w-4" />
        新しいES
      </Link>
      <Link href="/companies/new" className="mvp-button mvp-button-primary">
        <PlusIcon className="h-4 w-4" />
        企業を追加
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerActions={headerActions}
      className="flex flex-col gap-10"
    >
      {/* Status Notice */}
      {!isAuthed && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-soft">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            デモ表示中です。ログインすると保存・編集が有効になります。
          </div>
        </div>
      )}

      {/* Header with Progress */}
      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-md backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">Dashboard</p>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">AIとゲーミフィケーションで就活を前向きに</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-700">ESドラフト・企業分析・AIフィードバックを1か所に集約。XPで進捗を可視化し、毎週のモチベーションを維持します。</p>
          </div>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-5 text-sm shadow-soft">
            <div className="flex items-center gap-3">
              {avatarSrc ? (
                <Image src={avatarSrc} alt="avatar" width={56} height={56} className="h-14 w-14 rounded-2xl border border-slate-200 object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-lg font-bold text-slate-950 shadow">
                  {user?.email ? user.email.slice(0, 2).toUpperCase() : "LV"}
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-slate-600">レベル進捗</p>
                <p className="text-sm font-semibold text-slate-900">Lv.3 / {xp} XP</p>
                <p className="text-xs text-amber-700">次のレベルまで {Math.max(XP_NEXT_LEVEL - xp, 0)} XP</p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400" style={{ width: `${Math.min((xp / XP_NEXT_LEVEL) * 100, 100)}%` }} aria-hidden />
            </div>
            {isAuthed && (
              <div className="mt-4">
                <SignOutButton />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-md">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>{item.title}</span>
              <span className="text-base">{item.icon}</span>
            </div>
            <p className="mt-2 text-sm text-amber-700">{item.value}</p>
          </div>
        ))}
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Today's Focus */}
        <article className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">今日のフォーカス</h2>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700 shadow">{todayTasks.length} 件</span>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-800">
            {todayTasks.map((task) => (
              <li key={task} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow">
                <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* ES Status */}
        <article className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-md lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">ESの最新状況</h2>
            <Link href="/es" className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-800 hover:bg-white">
              一覧を見る
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {esEntries.map((es) => (
              <Link key={es.id} href={`/es/${es.id}`} className="block">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow transition-all hover:shadow-md hover:-translate-y-1">
                  <p className="text-sm font-semibold text-slate-900">{es.title}</p>
                  <p className="mt-2 text-xs text-slate-600">更新日: {es.updated_at ? new Date(es.updated_at).toLocaleDateString() : "-"}</p>
                  {es.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-amber-700">
                      {es.tags.map((tag: string) => (
                        <span key={tag} className="rounded-full bg-amber-50 px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-700">
                    <span className="rounded-full bg-slate-100 px-3 py-1 capitalize">{es.status}</span>
                    {es.score ? <span className="font-semibold text-amber-700">スコア {es.score}</span> : <span className="text-slate-500">スコア -</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>

      {/* Bottom Section */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Companies */}
        <article className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-md lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">最新の企業カード</h2>
            <Link href="/companies" className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-800 hover:bg-white">
              一覧を見る
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {companies.map((company) => (
              <Link key={company.id} href={`/companies/${company.id}`} className="block">
                <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 shadow transition-all hover:shadow-md">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{company.name}</p>
                    <p className="text-xs text-slate-600">{company.url}</p>
                    <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-800 capitalize">{company.stage}</p>
                  </div>
                  {company.favorite ? (
                    <span className="rounded-full bg-amber-300 px-2 py-1 text-[11px] font-semibold text-slate-900 shadow">Fav</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </article>

        {/* AI Queue */}
        <article className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">AIキュー</h2>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Gemini / GPT</span>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-800">
            {aiQueue.map((item) => (
              <li key={item.title} className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.provider}</span>
                  <span className="text-emerald-700">{item.status}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </AppLayout>
  );
}
