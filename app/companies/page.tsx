import Link from "next/link";
import { PlusIcon, StarIcon, HomeIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { redirect } from "next/navigation";

import { Database } from "@/lib/database.types";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { AppLayout } from "@/app/_components/layout";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

export default async function CompaniesPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const { data } = await supabase.from("companies").select("*").eq("user_id", userData.user.id).order("updated_at", { ascending: false }).limit(20);
  const companies: CompanyRow[] = data ?? [];

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href="/" className="mvp-button mvp-button-secondary">
        <HomeIcon className="h-4 w-4" />
        MVPホーム
      </Link>
      <Link href="/dashboard" className="mvp-button mvp-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        ダッシュボード
      </Link>
      <Link href="/companies/new" className="mvp-button mvp-button-primary">
        <PlusIcon className="h-4 w-4" />
        企業を追加
      </Link>
    </div>
  );

  return (
    <AppLayout headerTitle="企業管理" headerDescription="志望企業の情報と進捗を整理" headerActions={headerActions}>
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-amber-700">企業カード</p>
          <p className="text-sm text-slate-700">ステータス・志望度・メモをまとめ、すぐに編集できます。</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {companies.map((company) => (
            <Link key={company.id} href={`/companies/${company.id}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{company.name}</p>
                  <p className="text-xs text-slate-600">{company.url}</p>
                  <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-800 capitalize">{company.stage}</p>
                </div>
                {company.favorite ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                    <StarIcon className="h-3.5 w-3.5" />
                    Fav
                  </span>
                ) : null}
              </div>
              {company.memo ? <p className="mt-3 text-xs text-slate-700">{company.memo}</p> : null}
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
