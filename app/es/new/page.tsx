import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, HomeIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

import { createEs } from "../actions";
import { QuestionsEditor } from "../_components/questions-editor";
import { AppLayout } from "@/app/_components/layout";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";

export default async function NewEsPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const initialQuestions = [
    { id: crypto.randomUUID(), prompt: "自己PR（強み・成果）", answer_md: "" },
    { id: crypto.randomUUID(), prompt: "志望動機", answer_md: "" },
  ];

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href="/" className="mvp-button mvp-button-secondary">
        <HomeIcon className="h-4 w-4" />
        MVPへ
      </Link>
      <Link href="/dashboard" className="mvp-button mvp-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        ダッシュボード
      </Link>
      <Link href="/es" className="mvp-button mvp-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle="ESを新規作成"
      headerDescription="会社情報とES回答を登録し、AI添削に備えます。"
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-900 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-100">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">ES入力</h2>
          <p className="text-sm text-slate-700">企業名や選考ステータスを先に入れておくと、後のAI添削がスムーズになります。</p>
        </div>

        <form action={createEs} className="space-y-4 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-inner">
          <div className="space-y-2">
            <label className="block text-xs text-slate-600">企業名</label>
            <input
              name="company_name"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="例: Alpha SaaS"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-slate-600">タイトル*</label>
            <input
              name="title"
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="例: Alpha SaaS 新卒向けES"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block space-y-1 text-xs text-slate-600">
              選考ステータス
              <input
                name="selection_status"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="書類提出 / 面接 / 最終面接"
              />
            </label>
            <label className="block space-y-1 text-xs text-slate-600">
              企業ホームページURL
              <input
                name="company_url"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="https://example.com"
              />
            </label>
            <label className="block space-y-1 text-xs text-slate-600">
              メモ
              <input
                name="memo"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="選考メモや補足など"
              />
            </label>
            <label className="block space-y-1 text-xs text-slate-600">
              応募締切（日付）
              <input
                type="date"
                name="deadline"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
              />
            </label>
          </div>

          <QuestionsEditor initialQuestions={initialQuestions} />

          <div className="flex justify-end gap-3">
            <Link href="/es" className="mvp-button mvp-button-secondary">
              キャンセル
            </Link>
            <button type="submit" className="mvp-button mvp-button-primary">
              保存してAI準備
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
