import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon, BoltIcon } from "@heroicons/react/24/outline";

import { Database } from "@/lib/database.types";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { AppLayout } from "@/app/_components/layout";
import SignOutButton from "./_components/sign-out-button";
import { InteractiveCalendar } from "./_components/interactive-calendar";

type EsRow = Database["public"]["Tables"]["es_entries"]["Row"];
type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type CalendarRow = Database["public"]["Tables"]["calendar_events"]["Row"];

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  company?: string | null;
  type: "es" | "interview" | "intern" | "other";
  time?: string | null;
};

const todayTasks = [
  "ESを1件ドラフトしてAI添削を依頼",
  "企業カードのステータスを2件更新",
  "直近の面接メモを整理",
  "気になる企業をリストアップ",
];

const kpis = [
  { title: "ES", value: "下書き3 / 提出2", icon: "📝" },
  { title: "企業分析", value: "今週: 4件", icon: "🏢" },
  { title: "選考状況", value: "面接 2 / 通過 1", icon: "🎯" },
  { title: "タスク", value: "残り 3 件", icon: "📑" },
];

const fallbackEs: EsRow[] = [
  {
    id: "fallback-1",
    user_id: null,
    title: "SaaS PM インターン ES",
    content_md: "",
    questions: null,
    status: "draft",
    tags: ["SaaS"],
    score: null,
    ai_summary: null,
    company_name: "Alpha SaaS",
    company_url: null,
    selection_status: "書類提出",
    memo: null,
    deadline: "2025-01-20",
    created_at: null,
    updated_at: null,
  },
  {
    id: "fallback-2",
    user_id: null,
    title: "マーケ職向け ES",
    content_md: "",
    questions: null,
    status: "submitted",
    tags: ["Marketing"],
    score: null,
    ai_summary: null,
    company_name: "Sky Finance",
    company_url: null,
    selection_status: "面接",
    memo: null,
    deadline: "2025-01-10",
    created_at: null,
    updated_at: null,
  },
];

const fallbackCompanies: CompanyRow[] = [
  {
    id: "fallback-c1",
    user_id: null,
    name: "Alpha SaaS",
    url: "alphasaas.jp",
    memo: null,
    stage: "Screening",
    preference: 3,
    favorite: false,
    ai_summary: null,
    created_at: null,
    updated_at: null,
  },
  {
    id: "fallback-c2",
    user_id: null,
    name: "Sky Finance",
    url: "skyfin.co.jp",
    memo: null,
    stage: "Document passed",
    preference: 4,
    favorite: false,
    ai_summary: null,
    created_at: null,
    updated_at: null,
  },
];

const FALLBACK_XP = 150;
const XP_NEXT_LEVEL = 180;

async function getDashboardData() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;
  if (!userId) throw new Error("No user");

  const [esRes, companyRes, xpRes, profileRes, calendarRes] = await Promise.all([
    supabase
      .from("es_entries")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(12),
    supabase
      .from("companies")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase.from("xp_logs").select("xp").eq("user_id", userId),
    supabase
      .from("profiles")
      .select("full_name,avatar_id,university,faculty")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true }),
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
    calendarEvents: (calendarRes.data as CalendarRow[] | null) ?? [],
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData().catch(() => null);
  if (!data?.user) return redirect("/login");

  const avatarSrc = data.profile?.avatar_id ? `/avatars/${data.profile.avatar_id}.svg` : null;

  const calendarEvents: CalendarEvent[] = [
    ...(data.calendarEvents as CalendarRow[]).map((evt) => ({
      id: evt.id,
      date: evt.date ?? "",
      title: evt.title ?? "予定",
      company: evt.company,
      type: (evt.type as CalendarEvent["type"]) ?? "other",
      time: evt.time,
    })),
    ...((data.esEntries.length ? data.esEntries : fallbackEs)
      .filter((es) => !!es.deadline)
      .map((es) => ({
        id: `es-${es.id}`,
        date: es.deadline as string,
        title: es.title || "ES",
        company: es.company_name,
        type: "es" as const,
        time: null,
      }))),
  ];

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href="/" className="mvp-button mvp-button-secondary">
        MVPホーム
      </Link>
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
    <AppLayout headerActions={headerActions} className="space-y-8">
      <section className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              AIとゲーミフィケーションで就活を前向きに
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-700">
              ESドラフト・企業管理・AIフィードバックを1か所に集約し、XPで進捗を可視化。毎週のモチベーション維持を支援します。
            </p>
          </div>
          <div className="w-full rounded-2xl border border-slate-200 bg-white/90 p-5 text-sm shadow-soft backdrop-blur">
            <div className="flex items-center gap-3">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt="avatar"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-2xl border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-300 to-orange-500 text-lg font-bold text-slate-950 shadow">
                  {data.user.email ? data.user.email.slice(0, 2).toUpperCase() : "LV"}
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-slate-600">レベル進捗</p>
                <p className="text-sm font-semibold text-slate-900">Lv.3 / {data.xp} XP</p>
                <p className="text-xs text-amber-700">
                  次のレベルまで {Math.max(XP_NEXT_LEVEL - data.xp, 0)} XP
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-linear-to-r from-amber-400 to-rose-400"
                style={{ width: `${Math.min((data.xp / XP_NEXT_LEVEL) * 100, 100)}%` }}
                aria-hidden
              />
            </div>
            <div className="mt-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((item) => (
          <div
            key={item.title}
            className="h-full rounded-2xl border border-white/70 bg-white/80 p-4 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80"
          >
            <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>{item.title}</span>
              <span className="text-base">{item.icon}</span>
            </div>
            <p className="mt-2 text-sm text-amber-700">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.9fr_1fr]">
        <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80 min-h-[720px]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">締切カレンダー</h2>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
              ES / 面接 / インターン
            </span>
          </div>
          <InteractiveCalendar initialEvents={calendarEvents} />
        </div>

        <div className="flex flex-col gap-4">
          <article className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">今日のフォーカス</h2>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700 shadow">
                {todayTasks.length} 件
              </span>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-800">
              {todayTasks.map((task) => (
                <li
                  key={task}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow"
                >
                  <BoltIcon className="h-4 w-4 text-amber-500" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">ESの最新状況</h2>
              <Link
                href="/es"
                className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-800 hover:bg-white"
              >
                一覧を見る
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {(data.esEntries.length ? data.esEntries : fallbackEs)
                .slice(0, 2)
                .map((es) => (
                  <Link
                    key={es.id}
                    href={`/es/${es.id}`}
                    className="block rounded-xl border border-slate-200 bg-white px-4 py-3 shadow transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <p className="text-xs font-semibold text-slate-600">
                      {es.company_name || "企業名未設定"}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{es.title}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-700">
                      <span className="rounded-full bg-slate-100 px-3 py-1 capitalize">{es.status}</span>
                      <span className="text-slate-500">
                        締切: {es.deadline ? new Date(es.deadline).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">最新の企業カード</h2>
              <Link
                href="/companies"
                className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-800 hover:bg-white"
              >
                一覧を見る
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {(data.companies.length ? data.companies : fallbackCompanies)
                .slice(0, 2)
                .map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="block rounded-xl border border-slate-200 bg-white px-4 py-3 shadow transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <p className="text-sm font-semibold text-slate-900">{company.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
                        ステータス: {company.stage || "未設定"}
                      </span>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
                        志望度: {company.preference ?? "-"}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </article>
        </div>
      </section>
    </AppLayout>
  );
}
