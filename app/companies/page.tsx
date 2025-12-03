import Link from "next/link";
import { Database } from "@/lib/database.types";
import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import { CompanyListClient } from "./_components/company-list-client";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

export default async function CompanyListPage() {
  let companies: CompanyRow[] = [];
  try {
    const supabase = await createSupabaseReadonlyClient();
    if (supabase) {
      const { data } = await supabase.from("companies").select("*").order("updated_at", { ascending: false }).limit(12);
      companies = data ?? [];
    }
  } catch {
    // fallback below
  }
  if (companies.length === 0) {
    companies = [
      { id: "1", user_id: null, name: "Alpha SaaS", stage: "書類提出", url: "alphasaas.jp", memo: null, preference: 3, favorite: true, ai_summary: null, created_at: null, updated_at: null },
      { id: "2", user_id: null, name: "Sky Finance", stage: "面接中", url: "skyfin.co.jp", memo: null, preference: 3, favorite: false, ai_summary: null, created_at: null, updated_at: null },
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
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">Companies</p>
            <h1 className="text-3xl font-semibold">企業カード一覧</h1>
            <p className="text-sm text-slate-200/80">企業の詳細管理はこのページで行い、ダッシュボードには概要を表示します。</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10"
            >
              戻る
            </Link>
            <Link
              href="/companies/new"
              className="rounded-full bg-linear-to-r from-emerald-300 via-cyan-300 to-sky-300 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-400/30"
            >
              企業を追加
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CompanyListClient items={companies} />
        </div>
      </main>
    </div>
  );
}
