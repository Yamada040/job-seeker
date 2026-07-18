"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { notifyXpUpdated } from "@/lib/xp/level-up-signal";
import { Entry, Question } from "./es-detail/types";
import { EsAiPanel } from "./ai-es-panel";
import { QuestionsEditor } from "./questions-editor";

type Props = {
  entry: Entry;
  questions: Question[];
  combinedContent: string;
  handleUpdate: (formData: FormData) => Promise<void>;
  handleDelete: (formData: FormData) => Promise<void>;
};

function formatScore(score: number | null) {
  return typeof score === "number" ? `${Math.round(score)}点` : "未採点";
}

export function EsDetailClient({ entry, questions, combinedContent, handleUpdate, handleDelete }: Props) {
  const [editing, setEditing] = useState(entry.status !== "submitted");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-white/70">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              entry.status === "submitted"
                ? "border-emerald-500 bg-emerald-300 text-emerald-950"
                : "border-white/40 bg-black/60 text-white"
            }`}
          >
            {entry.status === "submitted" ? "提出済み" : "下書き"}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              typeof entry.score === "number"
                ? "border-yellow-300/60 bg-yellow-500/20 text-yellow-100"
                : "border-white/30 bg-black/40 text-white/50"
            }`}
          >
            AIスコア: {formatScore(entry.score)}
          </span>
          {entry.status === "submitted" && !editing && (
            <span className="text-xs text-white/50">提出済みをプレビュー表示中</span>
          )}
        </div>
      </div>

      {editing ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
          <div className="rounded-xl border border-[#3f3f46] bg-[#111111] p-6">
            <form
              action={async (formData) => {
                await handleUpdate(formData);
                // 提出でXPが付与された場合、XpBadge にレベルアップ Cookie の確認を促す
                notifyXpUpdated();
              }}
              className="space-y-4"
            >
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
                <input name="title" defaultValue={entry.title ?? ""} required className="dq-input text-sm" />
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
                  <input name="deadline" type="date" defaultValue={entry.deadline ?? ""} className="dq-input text-sm" />
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
                <button type="submit" name="intent" value="submit" className="sidebar-link-style text-sm">
                  提出として保存
                </button>
                <button type="submit" name="intent" value="save" className="sidebar-link-style text-sm">
                  下書きを保存
                </button>
                <button type="button" className="sidebar-link-style text-sm" onClick={() => setEditing(false)}>
                  プレビューへ
                </button>
              </div>
            </form>
          </div>
          <form action={handleDelete} className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-rose-400/60 bg-rose-950/30 px-3 py-2 text-sm font-bold text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
            >
              <TrashIcon className="h-4 w-4" />
              削除する
            </button>
          </form>

          <div className="rounded-xl border border-[#3f3f46] bg-[#111111] p-6">
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
          <div className="rounded-xl border border-[#3f3f46] bg-[#111111] p-6">
            <div className="space-y-4 text-sm text-white/90">
              <div>
                <p className="text-xs text-white/70">企業名</p>
                <p className="rounded-md border border-[#3f3f46] bg-[#1a1a1a] px-3 py-2 text-white">
                  {entry.company_name || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/70">タイトル</p>
                <p className="rounded-md border border-[#3f3f46] bg-[#1a1a1a] px-3 py-2 text-white">
                  {entry.title || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/70">AI添削スコア</p>
                <div className="rounded-md border border-[#3f3f46] bg-[#1a1a1a] px-3 py-2 text-white">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-yellow-100">{formatScore(entry.score)}</span>
                    {typeof entry.score === "number" ? (
                      <div className="h-2 flex-1 rounded-full bg-black/60">
                        <div
                          className="h-2 rounded-full bg-yellow-300"
                          style={{ width: `${Math.max(0, Math.min(100, Math.round(entry.score)))}%` }}
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-white/50">AI添削を保存すると表示されます</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-white/70">職種 / 募集枠</p>
                  <p className="rounded-md border border-[#3f3f46] bg-[#1a1a1a] px-3 py-2 text-white">
                    {entry.selection_status || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/70">締切日</p>
                  <p className="rounded-md border border-[#3f3f46] bg-[#1a1a1a] px-3 py-2 text-white">
                    {entry.deadline || "-"}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-white/70">企業URL</p>
                  <p className="break-all rounded-md border border-[#3f3f46] bg-[#1a1a1a] px-3 py-2 text-white">
                    {entry.company_url || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/70">メモ</p>
                  <p className="rounded-md border border-[#3f3f46] bg-[#1a1a1a] px-3 py-2 text-white">
                    {entry.memo || "-"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-white/70">本文</p>
                <p className="whitespace-pre-wrap rounded-md border border-[#3f3f46] bg-[#1a1a1a] px-3 py-2 text-sm text-white">
                  {entry.content_md || "-"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.status === "submitted" && (
                  <button type="button" onClick={() => setEditing(true)} className="sidebar-link-style text-sm">
                    編集する
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#3f3f46] bg-[#111111] p-6">
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
