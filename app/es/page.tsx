import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon, ArrowUturnLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

import { Database } from "@/lib/database.types";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { AppLayout } from "@/app/_components/layout";
import { EsListClient } from "./_components/es-list-client";

type EsRow = Database["public"]["Tables"]["es_entries"]["Row"];

export default async function EsListPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect(ROUTES.LOGIN);

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect(ROUTES.LOGIN);

  const { data: esData } = await supabase
    .from("es_entries")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("updated_at", { ascending: false })
    .limit(50);
  const esList: EsRow[] = esData ?? [];

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href={ROUTES.HOME} className="mvp-button mvp-button-secondary">
        <HomeIcon className="h-4 w-4" />
        MVPホーム
      </Link>
      <Link href={ROUTES.DASHBOARD} className="mvp-button mvp-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
      <Link href={ROUTES.ES_NEW} className="mvp-button mvp-button-primary">
        <PlusIcon className="h-4 w-4" />
        新規作成
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle="ES管理"
      headerDescription="下書きと提出済みを分けて管理できます"
      headerActions={headerActions}
      className="space-y-4"
    >
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-amber-700">ES一覧</p>
          <p className="text-sm text-slate-700">下書きと提出済みをタブレス表示。</p>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
          <EsListClient initialItems={esList} />
        </div>
      </div>
    </AppLayout>
  );
}
