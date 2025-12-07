"use client";

import { useEffect, useState } from "react";

type Props = {
  kind: "es_review" | "company_analysis";
  defaultInput: string;
  title: string;
  hint?: string;
  // 外部から入力を上書きしたいときに使う（例: 本文コピー）
  presetText?: string;
  presetKey?: string;
};

type AiResponse = {
  summary?: string;
  bulletPoints?: string[];
  provider?: string;
  error?: string;
};

export function AiPanel({ kind, defaultInput, title, hint, presetKey, presetText }: Props) {
  const [input, setInput] = useState(defaultInput);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wordCount = input.split(/\s+/).filter(Boolean).length;

  // presetKey が変わるたびに外部テキストで上書き
  useEffect(() => {
    if (!presetKey) return;
    setInput(presetText ?? "");
    setResponse(null);
    setError(null);
  }, [presetKey, presetText]);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, kind }),
      });
      const data = (await res.json()) as AiResponse;
      if (!res.ok || data.error) {
        throw new Error(data.error || "AI呼び出しに失敗しました");
      }
      setResponse(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-100 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-amber-200">{title}</p>
          {hint ? <p className="text-[11px] text-slate-200/70">{hint}</p> : null}
        </div>
        <span className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-slate-200">
          {response?.provider ?? "AI"}
        </span>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={8}
        className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300"
      />
      <div className="flex items-center justify-between text-[11px] text-slate-200/70">
        <span>単語数: {wordCount}</span>
        {hint ? <span>{hint}</span> : null}
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="rounded-full bg-linear-to-r from-emerald-300 via-cyan-300 to-sky-300 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 transition hover:translate-y-0.5 hover:shadow-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "実行中..." : "AIに送る"}
        </button>
      </div>
      {error ? <p className="mt-2 text-[11px] text-rose-300">Error: {error}</p> : null}
      {response ? (
        <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-slate-900/40 p-3">
          <p className="text-xs text-amber-200">要約</p>
          <p className="text-sm text-slate-100/90">{response.summary ?? "結果がありません"}</p>
          {response.bulletPoints?.length ? (
            <ul className="list-disc space-y-1 pl-4 text-sm text-slate-100/85">
              {response.bulletPoints.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
