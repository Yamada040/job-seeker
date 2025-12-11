import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon, ArrowUturnLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

import { AppLayout } from "@/app/_components/layout";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";

export default async function CompaniesPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (
    <AppLayout
      headerTitle="企業管理"
      headerDescription="志望度・ステータス・メモ・マイページ情報をまとめて管理"
      headerActions={
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="mvp-button mvp-button-secondary">
            <HomeIcon className="h-4 w-4" />
            MVPホーム
          </Link>
          <Link href="/dashboard" className="mvp-button mvp-button-secondary">
            <ArrowUturnLeftIcon className="h-4 w-4" />
            ダッシュボードへ
          </Link>
          <Link href="/companies/new" className="mvp-button mvp-button-primary">
            <PlusIcon className="h-4 w-4" />
            企業を追加
          </Link>
        </div>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{company.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{company.stage || "ステータス未設定"}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-100">
                  志望度: {company.preference ?? "-"}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-[12px] text-slate-600 dark:text-slate-300">
                {company.mypage_id ? <p>マイページID: {company.mypage_id}</p> : null}
                {company.mypage_url ? <p>マイページURL: {company.mypage_url}</p> : null}
                {company.url ? <p>公式: {company.url}</p> : null}
                {company.memo ? <p className="line-clamp-2">{company.memo}</p> : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
