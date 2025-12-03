import Link from "next/link";

import { updateEs, deleteEs } from "../actions";
import { AiPanel } from "@/app/_components/ai-panel";
import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";

type Props = { params: { id: string } };

const STATUS_OPTIONS = ["下書き", "提出済", "添削済"];

export default async function EsDetailPage({ params }: Props) {
  // Next.js が params を Promise 扱いするケースを回避
  const resolvedParams = await Promise.resolve(params);

  const supabase = await createSupabaseReadonlyClient();
  const { data: userData } = supabase ? await supabase.auth.getUser() : { data: null };

  const { data, error } =
    supabase && userData?.user
      ? await supabase
          .from("es_entries")
          .select("*")
          .eq("id", resolvedParams.id)
          .eq("user_id", userData.user.id)
          .maybeSingle()
      : { data: null, error: null };

  const fallback = {
    id: resolvedParams.id,
    user_id: userData?.user?.id ?? "guest",
    title: "サンプルES",
    content_md: "ここにES本文を入力してください。",
    status: "下書き",
    tags: ["サンプル"],
    score: null,
    created_at: null,
    updated_at: null,
  } as const;

  const es = data ?? fallback;
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
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">ES Detail</p>
            <h1 className="text-3xl font-semibold text-white">{es.title}</h1>
            <p className="text-sm text-slate-200/80">
              ESのステータスやタグを編集し、AI添削を試せます。
              {loadError ? "（データが見つからなかったためサンプルを表示しています）" : null}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/es" className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10">
              一覧へ戻る
            </Link>
            {canEdit ? (
              <form action={async () => deleteEs(resolvedParams.id)}>
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
          action={(formData) => updateEs(resolvedParams.id, formData)}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100 shadow-lg backdrop-blur"
        >
          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">タイトル</span>
            <input
              name="title"
              defaultValue={es.title}
              required
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">タグ（カンマ区切り）</span>
            <input
              name="tags"
              defaultValue={(es.tags ?? []).join(", ")}
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
              placeholder="SaaS, インターン, 志望度高"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">ステータス</span>
            <select
              name="status"
              defaultValue={es.status ?? "下書き"}
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">本文（Markdown）</span>
            <textarea
              name="content_md"
              rows={8}
              defaultValue={es.content_md ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
            />
          </label>

          <div className="flex justify-end gap-2">
            <Link href="/es" className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10">
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={!canEdit}
              className="rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:translate-y-0.5 hover:shadow-amber-500/50 disabled:opacity-60"
            >
              保存
            </button>
          </div>
        </form>

        <AiPanel
          kind="es_review"
          defaultInput={es.content_md ?? ""}
          title="AI添削を試す"
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
