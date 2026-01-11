import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUturnLeftIcon,
  HomeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { AppLayout } from "@/app/_components/layout";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";

export default async function InterviewsListPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect(ROUTES.LOGIN);
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect(ROUTES.LOGIN);

  const { data } = await supabase
    .from("interview_logs")
    .select(
      "id, company_name, interview_title, interview_date, stage, self_review, ai_summary, created_at"
    )
    .eq("user_id", userData.user.id)
    .order("interview_date", { ascending: false });

  const items = data ?? [];

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href={ROUTES.DASHBOARD} className="dq-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
      <Link href={ROUTES.HOME} className="dq-button-secondary">
        <HomeIcon className="h-4 w-4" />
        MVPホーム
      </Link>
      <Link
        href={ROUTES.INTERVIEWS_NEW}
        className="dq-button"
      >
        <PlusIcon className="h-4 w-4" />
        面接終了後のログを追加
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle="面接ログ一覧"
      headerDescription="面接後の質問・回答ログと振り返りを一覧表示し、詳細ページで更新できます。"
      headerActions={headerActions}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 ? (
          <div className="dq-card p-6 text-sm text-white">
            まだ面接ログがありません。右上の「面接終了後のログを追加」から記録を始めてください。
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={ROUTES.INTERVIEW_DETAIL(item.id)}
              className="dq-card flex flex-col gap-2 p-4 text-sm text-white transition hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs rounded-full bg-amber-50 px-2 py-1 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                  {item.stage === "template"
                    ? "雛形"
                    : item.stage || "面接回数未設定"}
                </span>
                <span className="text-xs text-white dark:text-white">
                  {item.stage === "template"
                    ? "-"
                    : item.interview_date
                      ? String(item.interview_date)
                      : "日付未設定"}
                </span>
              </div>
              <div className="text-base font-semibold">{item.company_name}</div>
              <div className="text-xs text-white dark:text-white">
                {item.stage === "template"
                  ? "準備用雛形"
                  : item.interview_title || "面接形式未設定"}
              </div>
              {item.ai_summary ? (
                <div className="mt-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                  AI改善サマリー保存済み
                </div>
              ) : null}
              <div className="truncate text-xs text-white dark:text-white">
                {item.self_review ? item.self_review : "振り返りは未入力です"}
              </div>
            </Link>
          ))
        )}
      </div>
    </AppLayout>
  );
}
