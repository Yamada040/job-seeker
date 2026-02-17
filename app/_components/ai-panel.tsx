"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon, ClipboardDocumentIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

import { BlockingOverlay } from "./blocking-overlay";
import { AiResponse } from "./ai-panel/types";
import { buildCopyText, sanitizeMarkdown } from "./ai-panel/utils";

type Props = {
  kind: "es_review" | "company_analysis" | "aptitude_analysis" | "self_analysis" | "interview_review";
  defaultInput: string;
  title: string;
  hint?: string;
  presetText?: string;
  presetKey?: string;
  cacheKey?: string;
  initialSummary?: unknown;
  saveUrl?: string;
  saveId?: string;
  onSaved?: () => void;
  showOneShotNotice?: boolean;
};

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
  showOneShotNotice = true,
}: Props) {
  const [input, setInput] = useState(defaultInput);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

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

  useEffect(() => {
    if (initialSummary) {
      try {
        const savedData = typeof initialSummary === "string" ? JSON.parse(initialSummary) : initialSummary;
        if (savedData && (savedData as AiResponse).summary) {
          setResponse({ ...(savedData as AiResponse), provider: (savedData as AiResponse).provider || "saved" });
          setSaved(true);
          onSaved?.();
          setError(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to parse initialSummary:", err);
        setError("保存済みのAI回答を読み込めませんでした。");
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

  useEffect(() => {
    if (!presetKey) return;
    if (saved && saveUrl) return;
    setInput(presetText ?? "");
    setResponse(null);
    setSaved(false);
    setError(null);
  }, [presetKey, presetText, saved, saveUrl]);

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
    if (saved && saveUrl) return;
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
      setError("保存に失敗しました。再度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!response) return;
    const text = buildCopyText(response);
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
      {overlay ? <BlockingOverlay message="AI処理中です。画面を閉じずにお待ちください。" /> : null}
      <div className="dq-card relative p-5 text-sm">
        {showOneShotNotice ? (
          <div className="dq-panel mb-3 px-3 py-2 text-[11px] font-semibold text-yellow-200">
            ※ 保存済みのAI回答は再実行できません。再度利用したい場合は運営にお問い合わせください。
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-yellow-200">{title}</p>
            {hint ? <p className="text-[11px] text-white/70">{hint}</p> : null}
            {cacheKey ? (
              <p className="text-[11px] text-white/50">
                ※ 1回保存すると再実行はできません。入力を確認してから送信してください。
              </p>
            ) : null}
          </div>
          <span className="rounded-full border border-white/40 bg-black/70 px-3 py-1 text-[11px] text-white/80">
            {response?.provider ?? "AI"}
          </span>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="dq-input mt-3 px-4 py-3 text-sm"
        />
        <div className="flex items-center justify-between text-[11px] text-white/60">
          <span>単語数: {wordCount}</span>
          {hint ? <span>{hint}</span> : null}
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleRun}
            disabled={loading || (saved && !!saveUrl)}
            className="dq-button text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "送信中..." : saved && !!saveUrl ? "保存済み" : "AIに送る"}
          </button>
        </div>

        {error ? <p className="mt-2 text-[11px] text-rose-300">Error: {error}</p> : null}

        {response ? (
          <div className="dq-panel mt-3 space-y-3 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-yellow-200">
                AI回答 {response?.provider === "saved" ? "（保存済み）" : ""}
              </p>
              <div className="flex gap-2">
                {saveUrl && saveId && !saved && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="dq-button-secondary text-[11px] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CloudArrowUpIcon className="h-4 w-4" />
                    <span>{saving ? "保存中..." : "保存する"}</span>
                  </button>
                )}
                {saved && saveUrl && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                    <CheckIcon className="h-4 w-4" />
                    <span>保存済み</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="dq-button-secondary text-[11px]"
                >
                  {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                  <span>{copied ? "コピー済み" : "コピー"}</span>
                </button>
              </div>
            </div>
            <div className="whitespace-pre-line text-sm leading-6 text-white/90">
              {response.summary ? sanitizeMarkdown(response.summary) : "回答がまだありません。"}
            </div>
            {response.bulletPoints?.length ? (
              <ul className="list-disc space-y-1 pl-4 text-sm text-white/90">
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
