import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";

import { Database } from "@/lib/database.types";
import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import { AppLayout } from "@/app/_components/layout";
import { EsListClient } from "./_components/es-list-client";

type EsRow = Database["public"]["Tables"]["es_entries"]["Row"];

export default async function EsListPage() {
  let esList: EsRow[] = [];
  try {
    const supabase = await createSupabaseReadonlyClient();
    if (supabase) {
      const { data } = await supabase.from("es_entries").select("*").order("updated_at", { ascending: false }).limit(12);
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
        title: "SaaS向け ES",
        status: "下書き",
        content_md: "",
        questions: null,
        tags: ["SaaS", "エンジニア"],
        score: 64,
        created_at: null,
        updated_at: "2025-12-01",
      },
      {
        id: "2",
        user_id: null,
        title: "コンサル志望 ES",
        status: "提出済",
        content_md: "",
        questions: null,
        tags: ["コンサル"],
        score: 72,
        created_at: null,
        updated_at: "2025-11-25",
      },
    ];
  }

  const headerActions = (
    <div className="flex gap-3">
      <Link href="/es/new" className="mvp-button mvp-button-primary">
        <PlusIcon className="h-4 w-4" />
        新規作成
      </Link>
    </div>
  );

  return (
    <AppLayout 
      headerTitle="ES管理"
      headerDescription="エントリーシートの作成・編集・管理"
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-md">
        <EsListClient initialItems={esList} />
      </section>
    </AppLayout>
  );
}
