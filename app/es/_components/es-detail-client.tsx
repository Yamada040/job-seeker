"use client";

import { useState } from "react";
import { Entry, Question } from "./es-detail/types";
import { EsEditSection } from "./es-detail/EsEditSection";
import { EsPreviewSection } from "./es-detail/EsPreviewSection";

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
        <div className="flex items-center gap-3 text-sm text-white/70">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              entry.status === "submitted"
                ? "border-emerald-300/50 bg-emerald-500/20 text-emerald-200"
                : "border-white/40 bg-black/60 text-white"
            }`}
          >
            {entry.status === "submitted" ? "提出済み" : "下書き"}
          </span>
          {entry.status === "submitted" && !editing && (
            <span className="text-xs text-white/50">提出済みをプレビュー表示中</span>
          )}
        </div>
      </div>

      {editing ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
          <div className="dq-card p-6">
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs text-white/70">
                  企業名<span className="text-rose-500">*</span>
                </label>
                <input
                  name="company_name"
                  defaultValue={entry.company_name ?? ""}
                  className="dq-input text-sm"
                  placeholder="例）Alpha SaaS"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-white/70">
                  ESタイトル<span className="text-rose-500">*</span>
                </label>
                <input
                  name="title"
                  defaultValue={entry.title ?? ""}
                  required
                  className="dq-input text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1 text-xs text-white/70">
                  職種 / 募集枠
                  <input
                    name="selection_status"
                    defaultValue={entry.selection_status ?? ""}
                    className="dq-input text-sm"
                    placeholder="例）エンジニア職"
                  />
                </label>
                <label className="block space-y-1 text-xs text-white/70">
                  締切日
                  <input
                    name="deadline"
                    type="date"
                    defaultValue={entry.deadline ?? ""}
                    className="dq-input text-sm"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1 text-xs text-white/70">
                  企業URL
                  <input
                    name="company_url"
                    defaultValue={entry.company_url ?? ""}
                    className="dq-input text-sm"
                    placeholder="https://example.com"
                  />
                </label>
                <label className="block space-y-1 text-xs text-white/70">
                  メモ
                  <input
                    name="memo"
                    defaultValue={entry.memo ?? ""}
                    className="dq-input text-sm"
                    placeholder="応募メモなど"
                  />
                </label>
              </div>

              <QuestionsEditor initialQuestions={questions} />

              <label className="block space-y-2 text-xs text-white/70">
                本文<span className="text-rose-500">*</span>
                <textarea
                  name="content_md"
                  rows={8}
                  defaultValue={entry.content_md ?? ""}
                  className="dq-input text-sm"
                  placeholder="本文を入力してください"
                  required
                />
              </label>

              <input type="hidden" name="questions_json" value={JSON.stringify(questions)} />

              <div className="flex flex-wrap gap-3">
                <button type="submit" name="intent" value="submit" className="dq-button">
                  提出として保存
                </button>
                <button type="submit" name="intent" value="save" className="dq-button-secondary">
                  下書きを保存
                </button>
                <button type="button" className="dq-button-secondary" onClick={() => setEditing(false)}>
                  プレビューへ
                </button>
              </div>
            </form>
          </div>
          <form action={handleDelete} className="flex justify-end">
            <button type="submit" className="dq-button-secondary text-rose-300">
              <TrashIcon className="h-4 w-4" />
              削除する
            </button>
          </form>

          <div className="dq-card p-6">
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
          <div className="dq-card p-6">
            <div className="space-y-4 text-sm text-white/90">
              <div>
                <p className="text-xs text-white/70">企業名</p>
                <p className="dq-panel px-3 py-2 text-white">{entry.company_name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-white/70">タイトル</p>
                <p className="dq-panel px-3 py-2 text-white">{entry.title || "-"}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-white/70">職種 / 募集枠</p>
                  <p className="dq-panel px-3 py-2 text-white">{entry.selection_status || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">締切日</p>
                  <p className="dq-panel px-3 py-2 text-white">{entry.deadline || "-"}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-white/70">企業URL</p>
                  <p className="dq-panel break-all px-3 py-2 text-white">{entry.company_url || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">メモ</p>
                  <p className="dq-panel px-3 py-2 text-white">{entry.memo || "-"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-white/70">本文</p>
                <p className="dq-panel whitespace-pre-wrap px-3 py-2 text-sm text-white">
                  {entry.content_md || "-"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.status === "submitted" && (
                  <button type="button" onClick={() => setEditing(true)} className="dq-button">
                    編集する
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="dq-card p-6">
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
