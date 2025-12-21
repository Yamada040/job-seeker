import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";

import { Database } from "@/lib/database.types";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { AppLayout } from "@/app/_components/layout";
import { InteractiveCalendar } from "./_components/interactive-calendar";

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
  return Math.max(1, Math.floor(xp / 500) + 1);
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

  const levelDisplay = (
      <div className="flex min-w-[360px] flex-1 items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-amber-900 shadow-sm dark:border-amber-500/40 dark:bg-amber-900/30 dark:text-amber-50">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold">Level</span>
          <span className="text-2xl font-bold">Lv.{level}</span>
          <span className="text-sm text-amber-700 dark:text-amber-200">XP {xp}</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 min-w-[180px]">
          <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100/80 dark:bg-amber-800/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-amber-800/80 dark:text-amber-100/80">
            <span>次まで {Math.max(0, nextThreshold - xp)} XP</span>
            <span>
              {prevThreshold} / {nextThreshold} XP
            </span>
          </div>
        </div>
      </div>
  );

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
    <AppLayout 
      headerLeftContent={levelDisplay}
      headerActions={navigationActions} 
      actionsPlacement="left" 
      className="space-y-6"
    >
      {/* 目標エリア */}
      <section className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">My Goal</p>
        <div className="mt-3 space-y-3">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">あなたの就活目標をいつでも思い出そう</h1>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            志望業界・職種や大切にしたい軸を短く書き留めておくと、日々の行動が目標に結びつきます。
          </p>
          <div className="grid gap-3 md:grid-cols-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            <span className="block rounded-2xl bg-amber-50 px-5 py-3 text-amber-800 shadow-sm ring-1 ring-amber-100 dark:bg-amber-900/30 dark:text-amber-100 dark:ring-amber-500/30">
              志望業界: {data.profile?.target_industry || "未設定"}
            </span>
            <span className="block rounded-2xl bg-emerald-50 px-5 py-3 text-emerald-800 shadow-sm ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-100 dark:ring-emerald-500/30">
              重視する軸: {data.profile?.career_axis || "未設定"}
            </span>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-amber-100 via-white to-rose-50 p-5 shadow-lg ring-1 ring-amber-100 dark:from-amber-900/40 dark:via-slate-900 dark:to-rose-900/30 dark:ring-amber-500/30">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-800/30" />
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">Goal Note</p>
            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-50">
              {data.profile?.goal_state || "未設定"}
            </p>
            {!data.profile?.goal_state && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
        <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">締切カレンダー</h2>
            <span className="text-xs text-slate-500">ES / 面接 / インターン</span>
          </div>
          <div className="mt-3">
            <InteractiveCalendar initialEvents={calendarEvents} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Urgent */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 shadow-sm dark:border-amber-500/30 dark:bg-amber-900/20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">直近で注意すべきこと</h3>
              <span className="text-[11px] text-amber-800/80 dark:text-amber-100/80">7日以内を表示</span>
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
                  <div key={evt.id} className="rounded-xl bg-white/70 p-3 text-sm shadow-sm dark:bg-amber-900/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">{evt.type === "es" ? "ES締切" : "面接"}</span>
                      <span>{evt.date}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-amber-900 dark:text-amber-50">{evt.company || evt.title}</p>
                    <p className="text-xs text-amber-800/80 dark:text-amber-100/80">{evt.title}</p>
                  </div>
                ))}
              {calendarEvents.filter((evt) => {
                const date = evt.date ? new Date(evt.date) : null;
                if (!date) return false;
                const diff = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 7 && (evt.type === "es" || evt.type === "interview");
              }).length === 0 && (
                <div className="rounded-xl border border-dashed border-amber-200/80 bg-white/50 p-3 text-xs text-amber-800 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-50">
                  直近1週間の締切・面接はありません。
                </div>
              )}
            </div>
          </div>

          {/* Next actions */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">次に取るべき行動</h3>
              <span className="text-[11px] text-slate-500">最大2件</span>
            </div>
            <div className="mt-3 space-y-3">
              {nextActions.map((action) => (
                <Link
                  key={`${action.title}-${action.href}-${action.subtitle}`}
                  href={action.href}
                  className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                >
                  <p className="text-xs font-semibold text-amber-700">{action.title}</p>
                  <p className="mt-1 text-base font-semibold">{action.subtitle}</p>
                </Link>
              ))}
              {nextActions.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-3 text-xs text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                  取り掛かるべきアクションはありません。
                </div>
              )}
            </div>
          </div>

          {/* 最近のXP獲得 */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">最近の獲得</h3>
              <span className="text-[11px] text-slate-500">最新5件</span>
            </div>
            <div className="mt-3 space-y-2">
              {recentXpLogs.map((log, idx) => (
                <div
                  key={`${log.created_at}-${idx}`}
                  className="rounded-xl border border-slate-200/70 bg-white/90 p-3 text-sm shadow-sm dark:border-slate-700/70 dark:bg-slate-800/80"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-50">+{log.xp} XP</span>
                    <span className="text-xs text-slate-500">
                      {log.created_at ? new Date(log.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{log.action || "行動"}</p>
                </div>
              ))}
              {recentXpLogs.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-3 text-xs text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                  まだXPはありません。ES提出や面接ログでXPを獲得できます。
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
