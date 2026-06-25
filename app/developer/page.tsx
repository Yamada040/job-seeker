import Link from "next/link";
import { redirect } from "next/navigation";

import { AppLayout } from "@/app/_components/layout";
import { isDeveloperUserId } from "@/lib/auth/developer";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseAdminClient, createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";

type Summary = {
  totalUsers: number;
  newUsers7d: number;
  activeUsers7d: number;
  activeUsersToday: number;
  totalEs: number;
  totalCompanies: number;
  totalInterviews: number;
  esCreated7d: number;
  companiesCreated7d: number;
  interviewsCreated7d: number;
};

const nf = new Intl.NumberFormat("ja-JP");

async function countDistinctXpUsers(sinceIso: string, todayIso: string) {
  const supabase = createSupabaseAdminClient();
  const chunkSize = 1000;
  const active7d = new Set<string>();
  const activeToday = new Set<string>();

  for (let page = 0; page < 60; page += 1) {
    const from = page * chunkSize;
    const to = from + chunkSize - 1;
    const { data, error } = await supabase
      .from("xp_logs")
      .select("user_id, created_at")
      .not("user_id", "is", null)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;
    if (!data?.length) break;

    for (const row of data) {
      if (!row.user_id) continue;
      active7d.add(row.user_id);
      if ((row.created_at ?? "") >= todayIso) {
        activeToday.add(row.user_id);
      }
    }

    if (data.length < chunkSize) break;
  }

  return { activeUsers7d: active7d.size, activeUsersToday: activeToday.size };
}

async function getSummary(): Promise<Summary> {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const since7d = new Date(now);
  since7d.setDate(now.getDate() - 7);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const since7dIso = since7d.toISOString();
  const todayIso = today.toISOString();

  const [
    totalUsersRes,
    newUsersRes,
    totalEsRes,
    totalCompaniesRes,
    totalInterviewsRes,
    es7dRes,
    companies7dRes,
    interviews7dRes,
    activeUsersRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since7dIso),
    supabase.from("es_entries").select("id", { count: "exact", head: true }),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("interview_logs").select("id", { count: "exact", head: true }),
    supabase.from("es_entries").select("id", { count: "exact", head: true }).gte("created_at", since7dIso),
    supabase.from("companies").select("id", { count: "exact", head: true }).gte("created_at", since7dIso),
    supabase.from("interview_logs").select("id", { count: "exact", head: true }).gte("created_at", since7dIso),
    countDistinctXpUsers(since7dIso, todayIso),
  ]);

  const errors = [
    totalUsersRes.error,
    newUsersRes.error,
    totalEsRes.error,
    totalCompaniesRes.error,
    totalInterviewsRes.error,
    es7dRes.error,
    companies7dRes.error,
    interviews7dRes.error,
  ].filter(Boolean);
  if (errors.length > 0) throw errors[0];

  return {
    totalUsers: totalUsersRes.count ?? 0,
    newUsers7d: newUsersRes.count ?? 0,
    activeUsers7d: activeUsersRes.activeUsers7d,
    activeUsersToday: activeUsersRes.activeUsersToday,
    totalEs: totalEsRes.count ?? 0,
    totalCompanies: totalCompaniesRes.count ?? 0,
    totalInterviews: totalInterviewsRes.count ?? 0,
    esCreated7d: es7dRes.count ?? 0,
    companiesCreated7d: companies7dRes.count ?? 0,
    interviewsCreated7d: interviews7dRes.count ?? 0,
  };
}

export default async function DeveloperDashboardPage() {
  const readonly = await createSupabaseReadonlyClient();
  const { data: userData } = await readonly.auth.getUser();
  if (!userData.user || !isDeveloperUserId(userData.user.id)) return redirect(ROUTES.DASHBOARD);

  const summary = await getSummary();
  const activeRate = summary.totalUsers > 0 ? Math.round((summary.activeUsers7d / summary.totalUsers) * 100) : 0;
  const contentTotal = summary.totalEs + summary.totalCompanies + summary.totalInterviews;
  const maxBar = Math.max(summary.esCreated7d, summary.companiesCreated7d, summary.interviewsCreated7d, 1);
  const updatedAt = new Date().toLocaleString("ja-JP");

  return (
    <AppLayout
      headerTitle="開発者ダッシュボード"
      headerDescription="全体の利用状況を確認"
      headerActions={
        <Link href={ROUTES.DASHBOARD} className="mvp-button mvp-button-secondary">
          ダッシュボードへ
        </Link>
      }
      className="space-y-6"
    >
      <div className="rounded-2xl border border-white/35 bg-black/60 p-4 backdrop-blur-sm sm:p-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="dq-window p-4">
            <p className="text-xs text-white/70">総ユーザー数</p>
            <p className="mt-2 text-3xl font-black text-white">{nf.format(summary.totalUsers)}</p>
          </div>
          <div className="dq-window p-4">
            <p className="text-xs text-white/70">7日アクティブユーザー</p>
            <p className="mt-2 text-3xl font-black text-emerald-200">{nf.format(summary.activeUsers7d)}</p>
            <p className="mt-1 text-xs text-white/60">稼働率 {activeRate}%</p>
          </div>
          <div className="dq-window p-4">
            <p className="text-xs text-white/70">7日新規ユーザー</p>
            <p className="mt-2 text-3xl font-black text-sky-200">{nf.format(summary.newUsers7d)}</p>
          </div>
          <div className="dq-window p-4">
            <p className="text-xs text-white/70">登録コンテンツ総数</p>
            <p className="mt-2 text-3xl font-black text-yellow-200">{nf.format(contentTotal)}</p>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="dq-window p-5">
            <p className="dq-title">7日投稿グラフ</p>
            <div className="mt-5 space-y-4 text-sm text-white">
              {[
                { label: "ES", value: summary.esCreated7d, tone: "bg-sky-300" },
                { label: "企業", value: summary.companiesCreated7d, tone: "bg-emerald-300" },
                { label: "面接ログ", value: summary.interviewsCreated7d, tone: "bg-amber-300" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span>{item.label}</span>
                    <span>{nf.format(item.value)}件</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 p-[2px]">
                    <div
                      className={`h-full rounded-full ${item.tone} transition-all`}
                      style={{ width: `${Math.max(8, Math.round((item.value / maxBar) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dq-window p-5">
            <p className="dq-title">稼働サマリー</p>
            <div className="mt-5 space-y-3 text-sm text-white">
              <div className="dq-item justify-between">
                <span>本日アクティブ</span>
                <span className="font-bold">{nf.format(summary.activeUsersToday)}人</span>
              </div>
              <div className="dq-item justify-between">
                <span>ES総数</span>
                <span className="font-bold">{nf.format(summary.totalEs)}件</span>
              </div>
              <div className="dq-item justify-between">
                <span>企業総数</span>
                <span className="font-bold">{nf.format(summary.totalCompanies)}件</span>
              </div>
              <div className="dq-item justify-between">
                <span>面接ログ総数</span>
                <span className="font-bold">{nf.format(summary.totalInterviews)}件</span>
              </div>
              <p className="pt-3 text-[11px] text-white/60">最終更新: {updatedAt}</p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
