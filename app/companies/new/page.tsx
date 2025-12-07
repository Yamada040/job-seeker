import Link from "next/link";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";

import { createCompany } from "../actions";
import { AppLayout } from "@/app/_components/layout";

export default function NewCompanyPage() {
  const headerActions = (
    <div className="flex gap-3">
      <Link href="/companies" className="mvp-button mvp-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
    </div>
  );

  return (
    <AppLayout 
      headerTitle="企業を追加"
      headerDescription="企業カードを作成してステータス・メモ・お気に入りを管理"
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      <form action={createCompany} className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-md backdrop-blur">
        <div className="space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">企業名 *</span>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="例：Alpha SaaS"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">URL</span>
            <input
              name="url"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="https://example.com"
            />
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">ステータス</span>
              <select 
                name="stage" 
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300" 
                defaultValue="未エントリー"
              >
                <option value="未エントリー">未エントリー</option>
                <option value="書類提出">書類提出</option>
                <option value="面接中">面接中</option>
                <option value="内定">内定</option>
                <option value="辞退">辞退</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">志望度（1-5）</span>
              <input
                name="preference"
                type="number"
                min={1}
                max={5}
                defaultValue={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">メモ</span>
            <textarea
              name="memo"
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="企業メモを記入"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="favorite" className="h-4 w-4 rounded border-slate-300 bg-slate-50" />
            お気に入りにする
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href="/companies" className="mvp-button mvp-button-secondary">
              キャンセル
            </Link>
            <button
              type="submit"
              className="mvp-button mvp-button-primary"
            >
              <PlusIcon className="h-4 w-4" />
              追加する
            </button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
