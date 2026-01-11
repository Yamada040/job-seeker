import { TrashIcon } from "@heroicons/react/24/outline";

import { QuestionsEditor } from "../questions-editor";
import { Entry, Question } from "./types";
import { EsAiPanelCard } from "./EsAiPanelCard";

type Props = {
  entry: Entry;
  questions: Question[];
  combinedContent: string;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onCancel: () => void;
};

export function EsEditSection({ entry, questions, combinedContent, onUpdate, onDelete, onCancel }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
      <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <form action={onUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs text-slate-600">
              企業名<span className="text-rose-500">*</span>
            </label>
            <input
              name="company_name"
              defaultValue={entry.company_name ?? ""}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="例）Alpha SaaS"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-slate-600">
              ESタイトル<span className="text-rose-500">*</span>
            </label>
            <input
              name="title"
              defaultValue={entry.title ?? ""}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-xs text-slate-600">
              職種 / 募集枠
              <input
                name="selection_status"
                defaultValue={entry.selection_status ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="例）エンジニア職"
              />
            </label>
            <label className="block space-y-1 text-xs text-slate-600">
              締切日
              <input
                name="deadline"
                type="date"
                defaultValue={entry.deadline ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-xs text-slate-600">
              企業URL
              <input
                name="company_url"
                defaultValue={entry.company_url ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="https://example.com"
              />
            </label>
            <label className="block space-y-1 text-xs text-slate-600">
              メモ
              <input
                name="memo"
                defaultValue={entry.memo ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="応募メモなど"
              />
            </label>
          </div>

          <QuestionsEditor initialQuestions={questions} />

          <label className="block space-y-2 text-xs text-slate-600">
            本文<span className="text-rose-500">*</span>
            <textarea
              name="content_md"
              rows={8}
              defaultValue={entry.content_md ?? ""}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="本文を入力してください"
              required
            />
          </label>

          <input type="hidden" name="questions_json" value={JSON.stringify(questions)} />

          <div className="flex flex-wrap gap-3">
            <button type="submit" name="intent" value="submit" className="mvp-button mvp-button-primary">
              提出として保存
            </button>
            <button type="submit" name="intent" value="save" className="mvp-button mvp-button-secondary">
              下書きを保存
            </button>
            <button type="button" className="mvp-button mvp-button-secondary" onClick={onCancel}>
              プレビューへ
            </button>
          </div>
        </form>
      </div>
      <form action={onDelete} className="flex justify-end">
        <button type="submit" className="mvp-button mvp-button-secondary text-rose-600">
          <TrashIcon className="h-4 w-4" />
          削除する
        </button>
      </form>

      <EsAiPanelCard entry={entry} combinedContent={combinedContent} />
    </div>
  );
}
