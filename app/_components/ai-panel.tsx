"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon, ClipboardDocumentIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { BlockingOverlay } from "./blocking-overlay";

type Props = {
  kind: "es_review" | "company_analysis";
  defaultInput: string;
  title: string;
  hint?: string;
  presetText?: string;
  presetKey?: string;
  cacheKey?: string;
  initialSummary?: any;
  saveUrl?: string;
  saveId?: string;
  onSaved?: () => void;
};

type AiResponse = {
  summary?: string;
  bulletPoints?: string[];
  provider?: string;
  error?: string;
};

function sanitizeMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*・]\s?/gm, "・")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .trim();
}

export function AiPanel({
  kind,
  defaultInput,
  title,
  hint,
  presetKey,
  presetText,
  cacheKey,
  initialSummary,
  saveUrl,
  saveId,
  onSaved,
}: Props) {
  const [input, setInput] = useState(defaultInput);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const wordCount = useMemo(() => input.split(/\s+/).filter(Boolean).length, [input]);

  const loadCache = (key?: string) => {
    if (!key) return null;
    const stored = sessionStorage.getItem(`ai-cache-${key}`);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  const saveCache = (key: string, data: AiResponse) => {
    sessionStorage.setItem(`ai-cache-${key}`, JSON.stringify(data));
  };

  // 初期値: 保存済み summary または sessionStorage キャッシュを読み込み
  useEffect(() => {
    if (initialSummary) {
      try {
        const savedData = typeof initialSummary === "string" ? JSON.parse(initialSummary) : initialSummary;
        if (savedData && (savedData.summary || savedData.bulletPoints)) {
          setResponse({ ...savedData, provider: savedData.provider || "saved" });
          setSaved(true);
          onSaved?.();
          setError(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to parse initialSummary:", err);
        setError("保存済みのAI結果を読み込めませんでした。");
      }
    }

    if (cacheKey) {
      const cached = loadCache(cacheKey);
      if (cached) {
        setResponse(cached);
        setError(null);
        setLoading(false);
      }
    }
  }, [cacheKey, initialSummary, onSaved]);

  // presetKey が変わったらテキストエリアを更新（保存済みならブロック）
  useEffect(() => {
    if (!presetKey) return;
    if (saved && saveUrl) return;
    setInput(presetText ?? "");
    setResponse(null);
    setSaved(false);
    setError(null);
  }, [presetKey, presetText, saved, saveUrl]);

  // 処理中はリロード・離脱警告を表示
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (loading || saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [loading, saving]);

  const handleRun = async () => {
    if (saved && saveUrl) return; // 保存済みは再実行禁止

    setLoading(true);
    setError(null);
    setResponse(null);
    setCopied(false);
    setSaved(false);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, kind }),
      });
      const data = (await res.json()) as AiResponse;
      if (!res.ok || data.error) {
        throw new Error(data.error || "AI呼び出しに失敗しました。");
      }
      setResponse(data);
      if (cacheKey) saveCache(cacheKey, data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!response || !saveUrl || !saveId) return;
    setSaving(true);
    try {
      const res = await fetch(saveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: saveId, summary: response }),
      });
      if (!res.ok) throw new Error("保存に失敗しました。");
      setSaved(true);
      onSaved?.();
    } catch (err) {
      console.error("Save failed:", err);
      setError("保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!response) return;
    const summary = response.summary ? sanitizeMarkdown(response.summary) : "";
    const bullets =
      response.bulletPoints?.length &&
      response.bulletPoints.map((b) => `・${sanitizeMarkdown(b)}`).join("\n");
    const text = [summary, bullets].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("copy failed", err);
    }
  };

  const overlay = loading || saving;

  return (
    <>
      {overlay ? <BlockingOverlay message="AI処理中です… 画面を閉じたりリロードしないでください。" /> : null}
      <div className="relative rounded-2xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-900 shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-700">{title}</p>
            {hint ? <p className="text-[11px] text-slate-500 dark:text-slate-300">{hint}</p> : null}
            {cacheKey ? (
              <p className="text-[11px] text-slate-400 dark:text-slate-500">※ 1度実行すると同じページでは再実行できません。</p>
            ) : null}
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
            {response?.provider ?? "AI"}
          </span>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300">
          <span>ワード数: {wordCount}</span>
          {hint ? <span>{hint}</span> : null}
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleRun}
            disabled={loading || (saved && !!saveUrl)}
            className="rounded-full bg-linear-to-r from-emerald-300 via-cyan-300 to-sky-300 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 transition hover:translate-y-0.5 hover:shadow-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "実行中..." : saved && !!saveUrl ? "保存済み" : "AIに送信"}
          </button>
        </div>

        {error ? <p className="mt-2 text-[11px] text-rose-500">Error: {error}</p> : null}

        {response ? (
          <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-amber-700">
                AI出力 {response?.provider === "saved" ? "（保存済み）" : ""}
              </p>
              <div className="flex gap-2">
                {saveUrl && saveId && !saved && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 rounded-full border border-emerald-500 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                  >
                    <CloudArrowUpIcon className="h-4 w-4" />
                    <span>{saving ? "保存中..." : "保存する"}</span>
                  </button>
                )}
                {saved && saveUrl && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <CheckIcon className="h-4 w-4" />
                    <span>保存済み</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-white dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                  <span>{copied ? "コピー完了" : "コピー"}</span>
                </button>
              </div>
            </div>
            <div className="whitespace-pre-line text-sm leading-6 text-slate-800 dark:text-slate-100">
              {response.summary ? sanitizeMarkdown(response.summary) : "結果なし"}
            </div>
            {response.bulletPoints?.length ? (
              <ul className="list-disc space-y-1 pl-4 text-sm text-slate-800 dark:text-slate-100">
                {response.bulletPoints.map((b, idx) => (
                  <li key={`${idx}-${b}`}>{sanitizeMarkdown(b)}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
