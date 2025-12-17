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
  initialSummary?: unknown;
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
  const [presetText, setPresetText] = useState<string>("");

  const aiInput = useMemo(() => {
    const lines = [
      name ? `企業名: ${name}` : "企業名: 情報不足",
      stage ? `選考ステータス: ${stage}` : null,
      url ? `URL: ${url}` : null,
      preference !== undefined && preference !== null ? `志望度: ${preference}` : null,
      memo ? `メモ: ${memo}` : null,
    ].filter(Boolean);
    return lines.join("\n");
  }, [memo, name, preference, stage, url]);

  useEffect(() => {
    setPresetText(aiInput);
  }, [aiInput]);

  return (
    <AiPanel
      kind="company_analysis"
      defaultInput={aiInput}
      presetText={presetText}
      cacheKey={cacheKey}
      initialSummary={initialSummary}
      saveUrl={saveUrl}
      saveId={saveId}
      title="AI企業要約"
      hint="企業概要・強み弱み・社風・就活への示唆を要約します。保存後は再実行できません。"
      showOneShotNotice
    />
  );
}
