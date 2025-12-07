"use client";

import { useState } from "react";
import { AiPanel } from "@/app/_components/ai-panel";

type Props = {
  content: string;
};

export function EsAiPanel({ content }: Props) {
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);

  const handleFill = () => {
    setPresetKey(`${Date.now()}`); // presetKey が変わると AiPanel が入力を上書き
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-100/85">ES本文をそのままAI入力にセットできます。</div>
        <button
          type="button"
          onClick={handleFill}
          className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          本文をAI入力にコピー
        </button>
      </div>
      <AiPanel kind="es_review" defaultInput={content} presetText={content} presetKey={presetKey} title="AI添削を試す" hint="Gemini/GPTは環境変数で切り替え。lib/ai/client.ts で実APIを呼び出しています。" />
    </div>
  );
}
