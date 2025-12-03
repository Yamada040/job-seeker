import Link from "next/link";

import { Database } from "@/lib/database.types";
import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import { EsListClient } from "./_components/es-list-client";

type EsRow = Database["public"]["Tables"]["es_entries"]["Row"];

export default async function EsListPage() {
  let esList: EsRow[] = [];
  try {
    const supabase = await createSupabaseReadonlyClient();
    if (supabase) {
      const { data } = await supabase
        .from("es_entries")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(12);
      esList = data ?? [];
    }
  } catch {
    // fallback below
  }

  if (esList.length === 0) {
    esList = [
      {
        id: "1",
        user_id: null,
        title: "SaaSスタートアップ向け ES",
        status: "下書き",
        content_md: "",
        tags: ["SaaS", "エンジニア"],
        score: 64,
        created_at: null,
        updated_at: "2025-12-01",
      },
      {
        id: "2",
        user_id: null,
        title: "メガバンク向け ES",
        status: "提出済",
        content_md: "",
        tags: ["金融"],
        score: 85,
        created_at: null,
        updated_at: "2025-11-30",
      },
    ];
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,196,38,0.14),transparent_60%)] blur-2xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_60%)] blur-2xl" />
      </div>
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-14 sm:px-10 sm:py-16">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">ES</p>
            <h1 className="text-3xl font-semibold">エントリーシート一覧</h1>
            <p className="text-sm text-slate-200/80">ここからESを作成・編集します。ダッシュボードは概要のみ。</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10"
            >
              戻る
            </Link>
            <Link
              href="/es/new"
              className="rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-amber-500/30"
            >
              新規ES作成
            </Link>
          </div>
        </div>

        <EsListClient items={esList} />
      </main>
    </div>
  );
}
