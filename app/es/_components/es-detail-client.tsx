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
        <EsEditSection
          entry={entry}
          questions={questions}
          combinedContent={combinedContent}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <EsPreviewSection
          entry={entry}
          combinedContent={combinedContent}
          onEdit={() => setEditing(true)}
        />
      )}
    </div>
  );
}
