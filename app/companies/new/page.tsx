import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, HomeIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

import { createCompany } from "../actions";
import { AppLayout } from "@/app/_components/layout";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";

export default async function NewCompanyPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href="/" className="mvp-button mvp-button-secondary">
        <HomeIcon className="h-4 w-4" />
        MVPホーム
      </Link>
      <Link href="/dashboard" className="mvp-button mvp-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
      <Link href="/companies" className="mvp-button mvp-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle="企業を追加"
      headerDescription="志望企業のカードを作成して進捗を管理"
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      <form
        action={createCompany}
        className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80"
      >
        <div className="space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">企業名</span>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="例）Alpha SaaS"
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

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">マイページID</span>
              <input
                name="mypage_id"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="ログインID"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">マイページURL</span>
              <input
                name="mypage_url"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="https://mypage.example.com"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">ステータス</span>
            <input
              name="stage"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="Screening / Document passed など"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">志望度（1-5）</span>
            <input
              name="preference"
              type="number"
              min="1"
              max="5"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">メモ</span>
            <textarea
              name="memo"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="興味を持った理由、応募メモ、インターン日程など"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="favorite" className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400" />
            お気に入りに追加
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link href="/companies" className="mvp-button mvp-button-secondary">
            キャンセル
          </Link>
          <button type="submit" className="mvp-button mvp-button-primary">
            追加する
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
