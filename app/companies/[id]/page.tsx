import Link from "next/link";

import { deleteCompany, updateCompany } from "../actions";
import { AiPanel } from "@/app/_components/ai-panel";
import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";

type Props = { params: { id: string } };

const STAGE_OPTIONS = ["未エントリー", "書類提出", "面接中", "内定", "辞退"];

export default async function CompanyDetailPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);

  const supabase = await createSupabaseReadonlyClient();
  const { data: userData } = supabase ? await supabase.auth.getUser() : { data: null };

  const { data, error } =
    supabase && userData?.user
      ? await supabase
          .from("companies")
          .select("*")
          .eq("id", resolvedParams.id)
          .eq("user_id", userData.user.id)
          .maybeSingle()
      : { data: null, error: null };

  const fallback = {
    id: resolvedParams.id,
    user_id: userData?.user?.id ?? "guest",
    name: "サンプル企業",
    url: "https://example.com",
    memo: "ここにメモを追加してください。",
    stage: "未エントリー",
    preference: 3,
    favorite: false,
    ai_summary: null,
    created_at: null,
    updated_at: null,
  } as const;

  const company = data ?? fallback;
  const loadError = Boolean(error || !data);
  const canEdit = Boolean(userData?.user);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,196,38,0.14),transparent_60%)] blur-2xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_60%)] blur-2xl" />
      </div>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-14 sm:px-10 sm:py-16">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">Company Detail</p>
            <h1 className="text-3xl font-semibold text-white">{company.name}</h1>
            <p className="text-sm text-slate-200/80">
              企業カードの情報を更新し、AI要約も試せます。
              {loadError ? "（データが見つからなかったためサンプルを表示しています）" : null}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/companies" className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10">
              一覧へ戻る
            </Link>
            {canEdit ? (
              <form action={async () => deleteCompany(resolvedParams.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-rose-300/60 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/20"
                >
                  削除
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <form
          action={(formData) => updateCompany(resolvedParams.id, formData)}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100 shadow-lg backdrop-blur"
        >
          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">企業名</span>
            <input
              name="name"
              defaultValue={company.name}
              required
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">URL</span>
            <input
              name="url"
              defaultValue={company.url ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
              placeholder="https://example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">ステータス</span>
            <select
              name="stage"
              defaultValue={company.stage ?? "未エントリー"}
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
            >
              {STAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">志望度（1-5）</span>
            <input
              name="preference"
              type="number"
              min={1}
              max={5}
              defaultValue={company.preference ?? 3}
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">メモ</span>
            <textarea
              name="memo"
              rows={4}
              defaultValue={company.memo ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-xs text-slate-200/80">
            <input type="checkbox" name="favorite" defaultChecked={Boolean(company.favorite)} className="h-4 w-4 rounded border-white/30 bg-slate-900/60" disabled={!canEdit} />
            お気に入りにする
          </label>

          <div className="flex justify-end gap-2">
            <Link href="/companies" className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10">
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={!canEdit}
              className="rounded-full bg-linear-to-r from-emerald-300 via-cyan-300 to-sky-300 px-5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 transition hover:translate-y-0.5 hover:shadow-emerald-400/50 disabled:opacity-50"
            >
              保存
            </button>
          </div>
        </form>

        <AiPanel
          kind="company_analysis"
          defaultInput={`${company.name} ${company.url ?? ""}`}
          title="AI企業分析を試す"
          hint="Gemini/GPTは環境変数で切り替え。lib/ai/client.ts で実APIを呼び出しています。"
        />

        {!canEdit ? (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            デモ表示中です。ログインすると保存・削除が有効になります。
          </div>
        ) : null}
      </main>
    </div>
  );
}
