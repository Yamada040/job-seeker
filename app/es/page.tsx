import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon, ArrowUturnLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

import { Database } from "@/lib/database.types";
import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import { AppLayout } from "@/app/_components/layout";
import { EsListClient } from "./_components/es-list-client";

type EsRow = Database["public"]["Tables"]["es_entries"]["Row"];

export default async function EsListPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const { data: esData } = await supabase.from("es_entries").select("*").eq("user_id", userData.user.id).order("updated_at", { ascending: false }).limit(20);
  const esList: EsRow[] = esData ?? [];

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
      <Link href="/es/new" className="mvp-button mvp-button-primary">
        <PlusIcon className="h-4 w-4" />
        新規作成
      </Link>
    </div>
  );

  return (
    <AppLayout headerTitle="ES管理" headerDescription="エントリーシートを整理し、AI添削に送る" headerActions={headerActions}>
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-amber-700">ES一覧</p>
          <p className="text-sm text-slate-700">ステータスやタグで絞り込み、気になるESをすぐ開けます。</p>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
          <EsListClient initialItems={esList} />
        </div>
      </div>
    </AppLayout>
  );
}
