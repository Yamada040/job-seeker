"use client";

import { useState } from "react";
import { AiPanel } from "@/app/_components/ai-panel";

type Props = {
  content: string;
};

export function EsAiPanel({ content }: Props) {
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);

  const handleFill = () => {
    // presetKey を変えると AiPanel に最新テキストを再読込させられる
    setPresetKey(`${Date.now()}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-800">ES本文をまとめてAIに送る</div>
        <button
          type="button"
          onClick={handleFill}
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white"
        >
          上の内容を貼り付ける
        </button>
      </div>
      <AiPanel
        kind="es_review"
        defaultInput={content}
        presetText={content}
        presetKey={presetKey}
        title="AI添削パネル"
        hint="Gemini/GPTは環境変数で切替可能です。lib/ai/client.ts にAPIキーを設定してください。"
      />
    </div>
  );
}
