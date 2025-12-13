import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUturnLeftIcon, HomeIcon, PlusIcon } from "@heroicons/react/24/outline";

import { AppLayout } from "@/app/_components/layout";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";

export default async function InterviewsListPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const { data } = await supabase
    .from("interview_logs")
    .select("id, company_name, interview_title, interview_date, stage, self_review, ai_summary, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  const items = data ?? [];

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href="/interviews/new" className="mvp-button mvp-button-primary">
        <PlusIcon className="h-4 w-4" />
        新規作成
      </Link>
      <Link href="/dashboard" className="mvp-button mvp-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
      <Link href="/" className="mvp-button mvp-button-secondary">
        <HomeIcon className="h-4 w-4" />
        MVPホーム
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle="面接ログ一覧"
      headerDescription="記録した面接を一覧表示し、詳細ページで編集・AI改善を実行できます"
      headerActions={headerActions}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600 shadow-sm">
            まだ面接ログがありません。右上の「新規作成」から記録を始めてください。
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/interviews/${item.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm text-slate-900 shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs rounded-full bg-amber-50 px-2 py-1 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                  {item.stage || "ステータス未設定"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{item.interview_date || "日付未設定"}</span>
              </div>
              <div className="text-base font-semibold">{item.company_name}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">{item.interview_title || "タイトル未設定"}</div>
              {item.ai_summary ? (
                <div className="mt-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                  AI改善サマリー保存済み
                </div>
              ) : null}
              <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                {item.self_review ? item.self_review : "自己評価は未入力です"}
              </div>
            </Link>
          ))
        )}
      </div>
    </AppLayout>
  );
}
