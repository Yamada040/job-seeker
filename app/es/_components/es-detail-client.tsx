"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";

import { QuestionsEditor } from "./questions-editor";
import { EsAiPanel } from "./ai-es-panel";

type Question = { id: string; prompt: string; answer_md: string };

type Entry = {
  id: string;
  company_name: string | null;
  selection_status: string | null;
  company_url: string | null;
  memo: string | null;
  deadline: string | null;
  title: string | null;
  status: string | null;
  content_md: string | null;
  ai_summary: string | null;
  tags: string[] | null;
};

type Props = {
  entry: Entry;
  questions: Question[];
  combinedContent: string;
  handleUpdate: (formData: FormData) => Promise<void>;
  handleDelete: (formData: FormData) => Promise<void>;
};

export function EsDetailClient({ entry, questions, combinedContent, handleUpdate, handleDelete }: Props) {
  const [editing, setEditing] = useState(entry.status !== "submitted");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${entry.status === "submitted" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
              }`}
          >
            {entry.status === "submitted" ? "提出済み" : "下書き"}
          </span>
          {entry.status === "submitted" && !editing && <span className="text-xs text-slate-500">提出済みをプレビュー表示中</span>}
        </div>
      </div>

      {editing ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
          <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
            <form action={handleUpdate} className="space-y-4">
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
                  提出日
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
                <button type="button" className="mvp-button mvp-button-secondary" onClick={() => setEditing(false)}>
                  プレビューへ
                </button>
              </div>
            </form>
          </div>
          <form action={handleDelete} className="flex justify-end">
            <button type="submit" className="mvp-button mvp-button-secondary text-rose-600">
              <TrashIcon className="h-4 w-4" />
              削除する
            </button>
          </form>

          <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
            <EsAiPanel
              content={combinedContent}
              cacheKey={`es-${entry.id}`}
              initialSummary={entry.ai_summary}
              saveUrl="/api/ai/es"
              saveId={entry.id}
              defaultCompanyName={entry.company_name}
              defaultStatus={entry.status ?? undefined}
              defaultCompanyUrl={entry.company_url}
              defaultTitle={entry.title}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
          <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
            <div className="space-y-4 text-sm text-slate-800">
              <div>
                <p className="text-xs text-slate-600">企業名</p>
                <p className="rounded-lg border border-slate-200 bg-white px-3 py-2">{entry.company_name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">タイトル</p>
                <p className="rounded-lg border border-slate-200 bg-white px-3 py-2">{entry.title || "-"}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-600">職種 / 募集枠</p>
                  <p className="rounded-lg border border-slate-200 bg-white px-3 py-2">{entry.selection_status || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">提出日</p>
                  <p className="rounded-lg border border-slate-200 bg-white px-3 py-2">{entry.deadline || "-"}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-600">企業URL</p>
                  <p className="break-all rounded-lg border border-slate-200 bg-white px-3 py-2">{entry.company_url || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">メモ</p>
                  <p className="rounded-lg border border-slate-200 bg-white px-3 py-2">{entry.memo || "-"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-600">本文</p>
                <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                  {entry.content_md || "-"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.status === "submitted" && (
                  <button type="button" onClick={() => setEditing(true)} className="mvp-button mvp-button-primary">
                    編集する
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
            <EsAiPanel
              content={combinedContent}
              cacheKey={`es-${entry.id}`}
              initialSummary={entry.ai_summary}
              saveUrl="/api/ai/es"
              saveId={entry.id}
              defaultCompanyName={entry.company_name}
              defaultStatus={entry.status ?? undefined}
              defaultCompanyUrl={entry.company_url}
              defaultTitle={entry.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}
