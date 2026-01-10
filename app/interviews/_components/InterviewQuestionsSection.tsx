import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

import { InterviewQA } from "../types";
import { Field } from "./interview-fields";

type Props = {
  questions: InterviewQA[];
  onChange: (index: number, key: keyof InterviewQA, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export function InterviewQuestionsSection({ questions, onChange, onAdd, onRemove }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">質問ログ（質問・回答・自己評価）</span>
        <button type="button" onClick={onAdd} className="mvp-button mvp-button-secondary">
          <PlusIcon className="h-4 w-4" />
          行を追加
        </button>
      </div>
      <div className="space-y-3">
        {questions.map((qa, idx) => (
          <div
            key={`${idx}-${qa.question}-${qa.answer}`}
            className="space-y-3 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/80"
          >
            <div className="grid gap-2 md:grid-cols-2">
              <Field
                label={`質問 ${idx + 1}`}
                value={qa.question}
                onChange={(value) => onChange(idx, "question", value)}
                placeholder="自己紹介をお願いします など"
              />
              <Field
                label="自分の回答（要点）"
                value={qa.answer}
                onChange={(value) => onChange(idx, "answer", value)}
                placeholder="研究概要と志望理由を簡潔に述べた"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs text-slate-600 dark:text-slate-300">自己評価</label>
              <select
                value={qa.rating}
                onChange={(e) => onChange(idx, "rating", e.target.value as InterviewQA["rating"])}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="good">良い</option>
                <option value="average">普通</option>
                <option value="bad">悪い</option>
              </select>
              {questions.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-rose-500 hover:underline"
                >
                  <TrashIcon className="h-4 w-4" />
                  削除
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
