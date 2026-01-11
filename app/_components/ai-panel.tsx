"use client";

import { useEffect, useMemo, useState } from "react";

import { BlockingOverlay } from "./blocking-overlay";
import { AiPanelHeader } from "./ai-panel/AiPanelHeader";
import { AiPanelInput } from "./ai-panel/AiPanelInput";
import { AiPanelNotice } from "./ai-panel/AiPanelNotice";
import { AiPanelResponse } from "./ai-panel/AiPanelResponse";
import { AiResponse } from "./ai-panel/types";
import { buildCopyText } from "./ai-panel/utils";

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
      <div className="relative rounded-2xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-900 shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
        <AiPanelNotice show={showOneShotNotice} />
        <AiPanelHeader title={title} hint={hint} cacheKey={cacheKey} response={response} />
        <AiPanelInput
          input={input}
          onChange={setInput}
          wordCount={wordCount}
          hint={hint}
          loading={loading}
          saved={saved}
          saveUrl={saveUrl}
          onRun={handleRun}
        />

        {error ? <p className="mt-2 text-[11px] text-rose-500">Error: {error}</p> : null}

        {response ? (
          <AiPanelResponse
            response={response}
            saveUrl={saveUrl}
            saveId={saveId}
            saved={saved}
            saving={saving}
            copied={copied}
            onSave={handleSave}
            onCopy={handleCopy}
          />
        ) : null}
      </div>
    </>
  );
}
