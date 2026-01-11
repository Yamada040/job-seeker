import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";

import { Database } from "@/lib/database.types";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { AppLayout } from "@/app/_components/layout";
import { buildCalendarEvents, buildInterviewActions, buildPendingEs } from "./_components/dashboard-helpers";
import { CalendarSection } from "./_components/sections/CalendarSection";
import { GoalSection } from "./_components/sections/GoalSection";
import { NextActionsPanel } from "./_components/sections/NextActionsPanel";
import { RecentXpPanel } from "./_components/sections/RecentXpPanel";
import { UrgentPanel } from "./_components/sections/UrgentPanel";

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

  const [esRes, profileRes, calendarRes, interviewsRes, xpLogsRes] = await Promise.all([
    supabase.from("es_entries").select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(12),
    supabase
      .from("profiles")
      .select("full_name,avatar_id,university,faculty,target_industry,career_axis,goal_state,xp,level")
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
    supabase.from("calendar_events").select("*").eq("user_id", userId).order("date", { ascending: true }),
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

  const calendarEvents = buildCalendarEvents(data.calendarEvents as CalendarRow[], data.esEntries);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pendingEs = buildPendingEs(data.esEntries, today);
  const interviewActions = buildInterviewActions(calendarEvents, data.interviewLogs ?? [], today);

  const nextActions = [
    ...pendingEs.slice(0, 2).map((es) => ({
      title: "ESを進める",
      subtitle: `${es.company_name || "企業名未設定"} / 締切 ${es.deadline ? new Date(es.deadline).toLocaleDateString() : "未設定"}`,
      href: ROUTES.ES_DETAIL(es.id),
    })),
    ...interviewActions,
  ].slice(0, 2);

  const recentXpLogs = data.xpLogs ?? [];

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
      <GoalSection
        targetIndustry={data.profile?.target_industry}
        careerAxis={data.profile?.career_axis}
        goalState={data.profile?.goal_state}
      />

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <CalendarSection events={calendarEvents} />

        <div className="space-y-4">
          <UrgentPanel events={calendarEvents} today={today} />
          <NextActionsPanel actions={nextActions} />
          <RecentXpPanel logs={recentXpLogs} />
        </div>
      </section>
    </AppLayout>
  );
}
