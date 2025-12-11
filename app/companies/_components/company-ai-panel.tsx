"use client";

import { useEffect, useMemo, useState } from "react";
import { AiPanel } from "@/app/_components/ai-panel";

type Props = {
  name?: string | null;
  url?: string | null;
  stage?: string | null;
  preference?: number | null;
  memo?: string | null;
  cacheKey?: string;
  initialSummary?: any;
  saveUrl?: string;
  saveId?: string;
};

export function CompanyAiPanel({
  name,
  url,
  stage,
  preference,
  memo,
  cacheKey,
  initialSummary,
  saveUrl,
  saveId,
}: Props) {
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);
  const [presetText, setPresetText] = useState<string>("");
  const [saved, setSaved] = useState(false);

  const aiInput = useMemo(() => {
    const lines = [
      name ? `企業名: ${name}` : "企業名: 情報不足",
      stage ? `選考ステータス: ${stage}` : null,
      url ? `URL: ${url}` : null,
      preference ? `志望度: ${preference}` : null,
      memo ? `メモ: ${memo}` : null,
    ].filter(Boolean);
    return lines.join("\n");
  }, [name, url, stage, preference, memo]);

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
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {saved && saveUrl ? "保存済み（再実行不可）" : "企業情報をAIフォームに転記"}
        </button>
      </div>

      <AiPanel
        kind="company_analysis"
        defaultInput={aiInput}
        presetText={presetText}
        presetKey={presetKey}
        cacheKey={cacheKey}
        initialSummary={initialSummary}
        saveUrl={saveUrl}
        saveId={saveId}
        title="AI企業ブリーフパネル"
        hint="企業名は必須。URLやステータスがあると精度が上がります。情報不足の場合は推測せず、情報不足と記載します。"
        onSaved={() => setSaved(true)}
      />
    </div>
  );
}
