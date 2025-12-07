import Link from "next/link";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";

import { createEs } from "../actions";
import { QuestionsEditor } from "../_components/questions-editor";
import { AppLayout } from "@/app/_components/layout";

export default function NewEsPage() {
  const initialQuestions = [
    { id: crypto.randomUUID(), prompt: "自己PR（ガクチカ）", answer_md: "" },
    { id: crypto.randomUUID(), prompt: "志望動機", answer_md: "" },
  ];

  const headerActions = (
    <div className="flex gap-3">
      <Link href="/es" className="mvp-button mvp-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
    </div>
  );

  return (
    <AppLayout 
      headerTitle="新規ES作成"
      headerDescription="質問カードを追加しながらESを作成できます"
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      <form action={createEs} className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-md backdrop-blur">
        <div className="space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">タイトル *</span>
            <input
              name="title"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="例：SaaSスタートアップ向け ES"
            />
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">ステータス</span>
              <select 
                name="status" 
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300" 
                defaultValue="下書き"
              >
                <option value="下書き">下書き</option>
                <option value="提出済">提出済</option>
                <option value="添削済">添削済</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">タグ（カンマ区切り）</span>
              <input
                name="tags"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="SaaS, エンジニア, 夏インターン"
              />
            </label>
          </div>

          <div className="space-y-3">
            <QuestionsEditor initialQuestions={initialQuestions} />
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">全体メモ（任意、AI送信時にも使われます）</span>
            <textarea
              name="content_md"
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="補足メモやまとめを書きたい場合に使います。AI送信時にも含まれます。"
            />
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href="/es" className="mvp-button mvp-button-secondary">
              キャンセル
            </Link>
            <button
              type="submit"
              className="mvp-button mvp-button-primary"
            >
              <PlusIcon className="h-4 w-4" />
              作成する
            </button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
