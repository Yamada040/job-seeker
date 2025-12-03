import Link from "next/link";
import { createCompany } from "../actions";

export default function NewCompanyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,196,38,0.14),transparent_60%)] blur-2xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_60%)] blur-2xl" />
      </div>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-14 sm:px-10 sm:py-16">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">Companies</p>
            <h1 className="text-3xl font-semibold">企業カードを追加</h1>
            <p className="text-sm text-slate-200/80">入力して保存するとSupabaseに反映されます。</p>
          </div>
          <Link
            href="/companies"
            className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10"
          >
            戻る
          </Link>
        </div>
        <form
          action={createCompany}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100 shadow-lg backdrop-blur space-y-4"
        >
          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">企業名*</span>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300"
              placeholder="Awesome Inc."
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">URL</span>
            <input
              name="url"
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300"
              placeholder="https://example.com"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">ステータス</span>
            <select
              name="stage"
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300"
              defaultValue="未エントリー"
            >
              <option value="未エントリー">未エントリー</option>
              <option value="書類提出">書類提出</option>
              <option value="面接中">面接中</option>
              <option value="カジュアル面談">カジュアル面談</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">志望度（1-5）</span>
            <input
              name="preference"
              type="number"
              min={1}
              max={5}
              defaultValue={3}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">メモ</span>
            <textarea
              name="memo"
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300"
              placeholder="メモや気になる点を記入"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Link
              href="/companies"
              className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="rounded-full bg-linear-to-r from-emerald-300 via-cyan-300 to-sky-300 px-5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 transition hover:translate-y-0.5 hover:shadow-emerald-400/50"
            >
              追加する
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
