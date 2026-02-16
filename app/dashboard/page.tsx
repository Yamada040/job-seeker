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
import { GoalScroll } from "./_components/goal-scroll";

type EsRow = Database["public"]["Tables"]["es_entries"]["Row"];
type CalendarRow = Database["public"]["Tables"]["calendar_events"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type InterviewRow = Database["public"]["Tables"]["interview_logs"]["Row"];
type XpLogRow = Database["public"]["Tables"]["xp_logs"]["Row"];

async function getDashboardData() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;
  if (!userId) throw new Error("No user");

  const [esRes, profileRes, calendarRes, interviewsRes, xpLogsRes] =
    await Promise.all([
      supabase
        .from("es_entries")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(12),
      supabase
        .from("profiles")
        .select(
          "full_name,avatar_id,university,faculty,target_industry,career_axis,goal_state,xp,level"
        )
        .eq("id", userId)
        .maybeSingle<
          Pick<
            ProfileRow,
            | "full_name"
            | "avatar_id"
            | "university"
            | "faculty"
            | "target_industry"
            | "career_axis"
            | "goal_state"
            | "xp"
            | "level"
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
    profile: profileRes.data as Pick<
      ProfileRow,
      | "full_name"
      | "avatar_id"
      | "university"
      | "faculty"
      | "target_industry"
      | "career_axis"
      | "goal_state"
      | "xp"
      | "level"
    > | null,
    calendarEvents: (calendarRes.data as CalendarRow[] | null) ?? [],
    interviewLogs,
    xpLogs: (xpLogsRes.data as XpLogRow[] | null) ?? [],
  };
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
    ...data.esEntries
      .filter((es) => !!es.deadline)
      .map((es) => ({
        id: `es-${es.id}`,
        date: es.deadline as string,
        title: es.title || "ES締切",
        company: es.company_name,
        type: "es" as const,
        time: null,
      })),
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pendingEs = [...data.esEntries]
    .filter(
      (es) =>
        es.status !== "submitted" &&
        es.deadline &&
        new Date(es.deadline) >= today
    )
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
      const hasLog = logs.some(
        (log) =>
          log.company_name === evt.company && log.interview_date === evt.date
      );
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
  const progress =
    nextThreshold > prevThreshold
      ? Math.min(1, (xp - prevThreshold) / (nextThreshold - prevThreshold))
      : 0;

  const navigationActions = (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={ROUTES.HOME} className="dq-button">
        ホームへ
      </Link>
      <Link href={ROUTES.ES_NEW} className="dq-button">
        <PlusIcon className="h-4 w-4" />
        ESを追加
      </Link>
      <Link
        href={ROUTES.COMPANIES_NEW}
        className="dq-button"
      >
        <PlusIcon className="h-4 w-4" />
        企業を追加
      </Link>
    </div>
  );
  const urgentEvents = calendarEvents
    .filter((evt) => {
      const date = evt.date ? new Date(evt.date) : null;
      if (!date) return false;
      const diff = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7 && (evt.type === "es" || evt.type === "interview");
    })
    .slice(0, 4);

  return (
    <AppLayout headerActions={navigationActions} className="space-y-6">
      <GoalScroll
        targetIndustry={data.profile?.target_industry}
        careerAxis={data.profile?.career_axis}
        goalState={data.profile?.goal_state}
      />

      {/* カレンダー + サイドカラム */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="dq-window">
          <span className="dq-title">クエストカレンダー</span>
          <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            ES / 面接 / インターン
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-3 shadow-inner">
            <InteractiveCalendar initialEvents={calendarEvents} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Urgent */}
          <EventListModal
            events={calendarEvents}
            trigger={
              <div className="dq-window cursor-pointer transition hover:scale-[1.02]">
                <span className="dq-title">至急クエスト</span>
                <div className="mt-3 space-y-3">
                  {urgentEvents.map((evt) => (
                    <div key={evt.id} className="dq-item">
                      <span className="text-xs animate-pulse">▶</span>
                      <label className="cursor-pointer text-sm font-bold">
                        {evt.company || evt.title} ({evt.date})
                      </label>
                    </div>
                  ))}
                  {urgentEvents.length === 0 && (
                    <div className="py-2 text-center text-xs text-white/60">
                      直近の 締切は ないようだ。
                    </div>
                  )}
                </div>
              </div>
            }
          />

          {/* Next actions */}
          <SimpleListModal
            trigger={
              <div className="dq-window cursor-pointer transition hover:scale-[1.02]">
                <span className="dq-title">次のクエスト</span>
                <div className="mt-3 space-y-3">
                  {nextActions.map((action) => (
                    <Link
                      key={`${action.title}-${action.href}-${action.subtitle}`}
                      href={action.href}
                      className="dq-item"
                    >
                      <span className="text-xs">▶</span>
                      <label className="cursor-pointer text-sm font-bold">
                        {action.subtitle}
                      </label>
                    </Link>
                  ))}
                  {nextActions.length === 0 && (
                    <div className="py-2 text-center text-xs text-white/60">
                      なすべきことは すべて おわった。
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
              <div className="dq-window cursor-pointer transition hover:scale-[1.02]">
                <span className="dq-title">戦歴ログ</span>
                <div className="mt-3 space-y-2">
                  {recentXpLogs.map((log, idx) => (
                    <div
                      key={`${log.created_at}-${idx}`}
                      className="dq-item justify-between border-b border-white/10 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-yellow-400">●</span>
                        <span className="text-sm">+{log.xp} XP</span>
                      </div>
                      <span className="text-[10px] opacity-60">
                        {log.action || "行動"}
                      </span>
                    </div>
                  ))}
                  {recentXpLogs.length === 0 && (
                    <div className="py-2 text-center text-xs text-white/60">
                      まだXPはありません。ES提出や面接ログでXPを獲得できます。
                    </div>
                  )}
                </div>
              </div>
            }
            items={recentXpLogs.map((log) => ({
              title: `+${log.xp} XP`,
              subtitle: log.action || "行動",
              meta: log.created_at
                ? new Date(log.created_at).toLocaleDateString()
                : "",
            }))}
            emptyText="XP獲得履歴がありません。"
          />
        </div>
      </section>
    </AppLayout>
  );
}
