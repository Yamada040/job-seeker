import Link from "next/link";
import { createEs } from "../actions";

export default function NewEsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,196,38,0.14),transparent_60%)] blur-2xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_60%)] blur-2xl" />
      </div>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-14 sm:px-10 sm:py-16">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">ES</p>
            <h1 className="text-3xl font-semibold">新規ES作成</h1>
            <p className="text-sm text-slate-200/80">
              Notion風の入力ボードでESを作成します。タイトル、ステータス、本文（Markdown）を自由に書けます。
            </p>
          </div>
          <Link
            href="/es"
            className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10"
          >
            戻る
          </Link>
        </div>

        <form
          action={createEs}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100 shadow-lg backdrop-blur space-y-4"
        >
          <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <label className="block text-xs text-slate-200/80">タイトル*</label>
            <input
              name="title"
              required
              className="w-full rounded-lg bg-transparent px-2 py-2 text-base font-semibold text-white outline-none placeholder:text-slate-500"
              placeholder="例：SaaSスタートアップ向け ES"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <label className="block text-xs text-slate-200/80">ステータス</label>
              <select
                name="status"
                className="w-full rounded-lg bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
                defaultValue="下書き"
              >
                <option value="下書き">下書き</option>
                <option value="提出済">提出済</option>
                <option value="添削済">添削済</option>
              </select>
            </div>
            <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <label className="block text-xs text-slate-200/80">タグ（任意・カンマ区切り）</label>
              <input
                name="tags"
                className="w-full rounded-lg bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="例：SaaS,エンジニア,夏インターン"
              />
              <p className="text-[11px] text-slate-400">※ カンマで分割し、テーブルのtags列に保存します。</p>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <label className="block text-xs text-slate-200/80">本文 (Markdown)</label>
            <textarea
              name="content_md"
              rows={12}
              className="w-full rounded-lg bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder={"例:\\n- ガクチカ: ...\\n- 成果: ...\\n- 学び: ...\\n- 志望動機: ..."}
            />
            <p className="text-[11px] text-slate-400">後でプレビュー/リッチテキスト対応を追加予定。</p>
          </div>

          <div className="flex justify-end gap-2">
            <Link
              href="/es"
              className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:translate-y-0.5 hover:shadow-amber-500/50"
            >
              作成する
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
