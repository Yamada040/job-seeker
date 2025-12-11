"use client";

import { useEffect, useMemo, useState } from "react";

import { AiPanel } from "@/app/_components/ai-panel";

type Props = {
  content: string;
  cacheKey?: string;
  initialSummary?: any;
  saveUrl?: string;
  saveId?: string;
  defaultCompanyName?: string | null;
  defaultStatus?: string | null;
  defaultCompanyUrl?: string | null;
  defaultTitle?: string | null;
};

export function EsAiPanel({
  content,
  cacheKey,
  initialSummary,
  saveUrl,
  saveId,
  defaultCompanyName,
  defaultStatus,
  defaultCompanyUrl,
  defaultTitle,
}: Props) {
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);
  const [presetText, setPresetText] = useState<string>("");
  const [saved, setSaved] = useState(false);

  const aiInput = useMemo(() => {
    const meta = [
      defaultCompanyName ? `企業名: ${defaultCompanyName}` : null,
      defaultTitle ? `ESタイトル: ${defaultTitle}` : null,
      defaultStatus ? `選考ステータス: ${defaultStatus}` : null,
      defaultCompanyUrl ? `URL: ${defaultCompanyUrl}` : null,
    ].filter(Boolean);
    return [...meta, content].filter(Boolean).join("\n\n");
  }, [content, defaultCompanyName, defaultStatus, defaultCompanyUrl, defaultTitle]);

  useEffect(() => {
    setPresetText(aiInput);
  }, [aiInput]);

  useEffect(() => {
    if (initialSummary) {
      setSaved(true);
    }
  }, [initialSummary]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (saved && saveUrl) return;
            setPresetText(aiInput);
            setPresetKey(`${Date.now()}`);
          }}
          disabled={saved && !!saveUrl}
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {saved && saveUrl ? "保存済み（再実行不可）" : "AIに送る内容を転記"}
        </button>
      </div>

      <AiPanel
        kind="es_review"
        defaultInput={aiInput}
        presetText={presetText}
        presetKey={presetKey}
        cacheKey={cacheKey}
        initialSummary={initialSummary}
        saveUrl={saveUrl}
        saveId={saveId}
        title="AI添削パネル"
        hint="ボタンでES内容を転記してから送信してください。保存後は再実行できません。"
        onSaved={() => setSaved(true)}
      />
    </div>
  );
}
