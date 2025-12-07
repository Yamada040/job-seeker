import Link from "next/link";
import { PlusIcon, StarIcon } from "@heroicons/react/24/outline";

import { Database } from "@/lib/database.types";
import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import { AppLayout } from "@/app/_components/layout";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

export default async function CompaniesPage() {
  let companies: CompanyRow[] = [];
  try {
    const supabase = await createSupabaseReadonlyClient();
    if (supabase) {
      const { data } = await supabase.from("companies").select("*").order("updated_at", { ascending: false }).limit(20);
      companies = data ?? [];
    }
  } catch {
    // fallback below
  }

  if (companies.length === 0) {
    companies = [
      { id: "c1", user_id: null, name: "Alpha SaaS", url: "alphasaas.jp", memo: "SaaSプロダクトが強い", stage: "未エントリー", preference: 3, favorite: true, ai_summary: null, created_at: null, updated_at: null },
      { id: "c2", user_id: null, name: "Sky Finance", url: "skyfin.co.jp", memo: "フィンテック系", stage: "書類提出", preference: 3, favorite: false, ai_summary: null, created_at: null, updated_at: null },
    ];
  }

  const headerActions = (
    <div className="flex gap-3">
      <Link href="/companies/new" className="mvp-button mvp-button-primary">
        <PlusIcon className="h-4 w-4" />
        企業を追加
      </Link>
    </div>
  );

  return (
    <AppLayout 
      headerTitle="企業管理"
      headerDescription="志望企業の情報管理・分析・お気に入り管理"
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => (
          <Link
            key={c.id}
            href={`/companies/${c.id}`}
            className="block"
          >
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{c.name}</h3>
                    {c.favorite && <StarIcon className="h-4 w-4 text-amber-500" />}
                  </div>
                  <p className="text-sm text-slate-600">{c.url}</p>
                  <p className="text-sm text-slate-700">{c.memo ?? "メモなし"}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="mvp-badge mvp-badge-slate">{c.stage ?? "未設定"}</span>
                <span className="mvp-badge mvp-badge-amber">志望度: {c.preference ?? "-"}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </AppLayout>
  );
}
