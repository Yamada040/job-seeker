import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";

import { Database } from "@/lib/database.types";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { AppLayout } from "@/app/_components/layout";
import { InteractiveCalendar } from "./_components/interactive-calendar";
import { EventListModal } from "./_components/event-list-modal";
import { SimpleListModal } from "./_components/simple-list-modal";

type EsRow = Database["public"]["Tables"]["es_entries"]["Row"];
type CalendarRow = Database["public"]["Tables"]["calendar_events"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type InterviewRow = Database["public"]["Tables"]["interview_logs"]["Row"];
type XpLogRow = Database["public"]["Tables"]["xp_logs"]["Row"];

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  company?: string | null;
  type: "es" | "interview" | "intern" | "other";
  time?: string | null;
};

async function getDashboardData() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;
  if (!userId) throw new Error("No user");

  const [esRes, profileRes, calendarRes, interviewsRes, xpLogsRes] = await Promise.all([
    supabase
      .from("es_entries")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(12),
    supabase
      .from("profiles")
      .select("full_name,avatar_id,university,faculty,target_industry,career_axis,goal_state,xp,level")
      .eq("id", userId)
      .maybeSingle<
        Pick<
          ProfileRow,
          "full_name" | "avatar_id" | "university" | "faculty" | "target_industry" | "career_axis" | "goal_state" | "xp" | "level"
        >
      >(),
    supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true }),
    supabase
      .from("interview_logs")
      .select("id, company_name, interview_date, self_review, questions")
      .eq("user_id", userId),
    supabase
      .from("xp_logs")
      .select("xp, action, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const esEntries = (esRes.data as EsRow[] | null) ?? [];
  const interviewLogs = (interviewsRes.data as InterviewRow[] | null) ?? [];

  return {
    esEntries,
    user: userData?.user ?? null,
    profile: profileRes.data as
      | Pick<
          ProfileRow,
          "full_name" | "avatar_id" | "university" | "faculty" | "target_industry" | "career_axis" | "goal_state" | "xp" | "level"
        >
      | null,
    calendarEvents: (calendarRes.data as CalendarRow[] | null) ?? [],
    interviewLogs,
    xpLogs: (xpLogsRes.data as XpLogRow[] | null) ?? [],
  };
}

function computeLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 50) + 1);
}

export default async function DashboardPage() {
  const data = await getDashboardData().catch(() => null);
  if (!data?.user) return redirect(ROUTES.LOGIN);

  const calendarEvents: CalendarEvent[] = [
    ...(data.calendarEvents as CalendarRow[]).map((evt) => ({
      id: evt.id,
      date: evt.date ?? "",
      title: evt.title ?? "予定",
      company: evt.company ?? null,
      type: (evt.type as CalendarEvent["type"]) ?? "other",
      time: evt.time ?? null,
    })),
    ...(data.esEntries
      .filter((es) => !!es.deadline)
      .map((es) => ({
        id: `es-${es.id}`,
        date: es.deadline as string,
        title: es.title || "ES締切",
        company: es.company_name,
        type: "es" as const,
        time: null,
      }))),
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pendingEs = [...data.esEntries]
    .filter((es) => es.status !== "submitted" && es.deadline && new Date(es.deadline) >= today)
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  // 面接ログ未記入: 過去の面接イベントで記録が無いものを検出
  const interviewActions = (() => {
    const pastInterviews = calendarEvents.filter((evt) => {
      if (evt.type !== "interview") return false;
      const date = evt.date ? new Date(evt.date) : null;
      return date ? date < today : false;
    });
    const logs = data.interviewLogs ?? [];
    const missing = pastInterviews.filter((evt) => {
      const hasLog = logs.some((log) => log.company_name === evt.company && log.interview_date === evt.date);
      return !hasLog;
    });
    return missing.slice(0, 1).map((evt) => ({
      title: "面接ログを記録",
      subtitle: evt.company || evt.title,
      href: ROUTES.INTERVIEWS,
    }));
  })();

  const nextActions = [
    ...pendingEs.slice(0, 2).map((es) => ({
      title: "ESを進める",
      subtitle: `${es.company_name || "企業名未設定"} / 締切 ${es.deadline ? new Date(es.deadline).toLocaleDateString() : "未設定"}`,
      href: ROUTES.ES_DETAIL(es.id),
    })),
    ...interviewActions,
  ].slice(0, 2);

  const recentXpLogs = data.xpLogs ?? [];
  const fallbackXp = recentXpLogs.reduce((sum, log) => sum + (log.xp ?? 0), 0);
  const xp = data.profile?.xp ?? fallbackXp;
  const level = data.profile?.level ?? computeLevel(xp);
  const prevThreshold = Math.max(0, (level - 1) * 50);
  const nextThreshold = level * 50;
  const progress = nextThreshold > prevThreshold ? Math.min(1, (xp - prevThreshold) / (nextThreshold - prevThreshold)) : 0;

  const navigationActions = (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={ROUTES.HOME} className="mvp-button mvp-button-secondary">
        MVPホーム
      </Link>
      <Link href={ROUTES.ES_NEW} className="mvp-button mvp-button-primary">
        <PlusIcon className="h-4 w-4" />
        新しいES
      </Link>
      <Link href={ROUTES.COMPANIES_NEW} className="mvp-button mvp-button-primary">
        <PlusIcon className="h-4 w-4" />
        企業を追加
      </Link>
    </div>
  );

  return (
    <AppLayout headerActions={navigationActions} className="space-y-6">
      {/* 目標エリア */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl shadow-black/40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.12),transparent_55%)]" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">My Goal</p>
        <div className="relative mt-3 space-y-3">
          <h1 className="text-2xl font-semibold text-slate-100">あなたの就活目標をいつでも思い出そう</h1>
          <p className="text-sm text-slate-300">
            志望業界・職種や大切にしたい軸を短く書き留めておくと、日々の行動が目標に結びつきます。
          </p>
          <div className="grid gap-3 text-lg font-semibold text-slate-100 md:grid-cols-2">
            <span className="block rounded-2xl border border-amber-400/20 bg-amber-200/10 px-5 py-3 text-amber-100 shadow-sm">
              志望業界: {data.profile?.target_industry || "未設定"}
            </span>
            <span className="block rounded-2xl border border-emerald-400/20 bg-emerald-200/10 px-5 py-3 text-emerald-100 shadow-sm">
              重視する軸: {data.profile?.career_axis || "未設定"}
            </span>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-slate-900/80 p-5 shadow-lg">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/20 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Goal Note</p>
            <p className="mt-2 text-lg font-bold text-slate-100">{data.profile?.goal_state || "未設定"}</p>
            {!data.profile?.goal_state && (
              <p className="mt-1 text-xs text-slate-400">
                プロフィールで「就活で達成したい状態」を短く書いておくと、日々の行動が目標に結びつきます。
              </p>
            )}
          </div>
          <Link href={ROUTES.PROFILE} className="mvp-button mvp-button-secondary inline-flex">
            目標・軸を編集する
          </Link>
        </div>
      </section>

      {/* カレンダー + サイドカラム */}
      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">締切カレンダー</h2>
            <span className="text-xs text-slate-400">ES / 面接 / インターン</span>
          </div>
          <div className="mt-3 rounded-2xl border border-slate-800/60 bg-white/5 p-3">
            <InteractiveCalendar initialEvents={calendarEvents} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Urgent */}
          <EventListModal
            events={calendarEvents}
            trigger={
              <div className="cursor-pointer rounded-2xl border border-amber-400/30 bg-slate-950/85 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-amber-100">直近で注意すべきこと</h3>
                  <span className="text-[11px] text-amber-200/70">7日以内を表示</span>
                </div>
                <div className="mt-3 space-y-3">
                  {calendarEvents
                    .filter((evt) => {
                      const date = evt.date ? new Date(evt.date) : null;
                      if (!date) return false;
                      const diff = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                      return diff >= 0 && diff <= 7 && (evt.type === "es" || evt.type === "interview");
                    })
                    .slice(0, 4)
                    .map((evt) => (
                      <div key={evt.id} className="rounded-xl border border-amber-400/20 bg-amber-50/5 p-3 text-sm shadow-sm">
                        <div className="flex items-center justify-between text-xs text-amber-100/80">
                          <span className="font-semibold">{evt.type === "es" ? "ES締切" : "面接"}</span>
                          <span>{evt.date}</span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-amber-100">{evt.company || evt.title}</p>
                        <p className="text-xs text-amber-100/70">{evt.title}</p>
                      </div>
                    ))}
                  {calendarEvents.filter((evt) => {
                    const date = evt.date ? new Date(evt.date) : null;
                    if (!date) return false;
                    const diff = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                    return diff >= 0 && diff <= 7 && (evt.type === "es" || evt.type === "interview");
                  }).length === 0 && (
                    <div className="rounded-xl border border-dashed border-amber-400/30 bg-amber-50/5 p-3 text-xs text-amber-100/70">
                      直近1週間の締切・面接はありません。
                    </div>
                  )}
                </div>
              </div>
            }
          />

          {/* Next actions */}
          <SimpleListModal
            trigger={
              <div className="cursor-pointer rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-100">次に取るべき行動</h3>
                  <span className="text-[11px] text-slate-400">最大2件</span>
                </div>
                <div className="mt-3 space-y-3">
                  {nextActions.map((action) => (
                    <Link
                      key={`${action.title}-${action.href}-${action.subtitle}`}
                      href={action.href}
                      className="block rounded-xl border border-slate-800/70 bg-white/5 px-4 py-3 text-sm text-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-xs font-semibold text-amber-300">{action.title}</p>
                      <p className="mt-1 text-base font-semibold">{action.subtitle}</p>
                    </Link>
                  ))}
                  {nextActions.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-700 bg-white/5 p-3 text-xs text-slate-400 shadow-sm">
                      取り掛かるべきアクションはありません。
                    </div>
                  )}
                </div>
              </div>
            }
            items={nextActions.map((action) => ({
              title: action.title,
              subtitle: action.subtitle,
              meta: action.href,
            }))}
            emptyText="アクションはありません。"
          />

          {/* 最近のXP獲得 */}
          <SimpleListModal
            trigger={
              <div className="cursor-pointer rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-100">最近の獲得</h3>
                  <span className="text-[11px] text-slate-400">最新5件</span>
                </div>
                <div className="mt-3 space-y-2">
                  {recentXpLogs.map((log, idx) => (
                    <div
                      key={`${log.created_at}-${idx}`}
                      className="rounded-xl border border-slate-800/70 bg-white/5 p-3 text-sm shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">+{log.xp} XP</span>
                        <span className="text-xs text-slate-400">
                          {log.created_at ? new Date(log.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{log.action || "行動"}</p>
                    </div>
                  ))}
                  {recentXpLogs.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-700 bg-white/5 p-3 text-xs text-slate-400 shadow-sm">
                      まだXPはありません。ES提出や面接ログでXPを獲得できます。
                    </div>
                  )}
                </div>
              </div>
            }
            items={recentXpLogs.map((log) => ({
              title: `+${log.xp} XP`,
              subtitle: log.action || "行動",
              meta: log.created_at ? new Date(log.created_at).toLocaleDateString() : "",
            }))}
            emptyText="XP獲得履歴がありません。"
          />
        </div>
      </section>
    </AppLayout>
  );
}
