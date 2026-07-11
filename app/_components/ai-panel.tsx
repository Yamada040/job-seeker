"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { CheckIcon, ClipboardDocumentIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

import { BlockingOverlay } from "./blocking-overlay";
import { AiResponse } from "./ai-panel/types";
import { buildCopyText, sanitizeMarkdown } from "./ai-panel/utils";

type PanelState = {
  status: "idle" | "loading" | "saving" | "error";
  response: AiResponse | null;
  error: string | null;
  copied: boolean;
  saved: boolean;
};

type PanelAction =
  | { type: "loadStored"; response: AiResponse; saved: boolean }
  | { type: "loadFailed"; error: string }
  | { type: "resetForPreset" }
  | { type: "runStart" }
  | { type: "runSuccess"; response: AiResponse }
  | { type: "runError"; error: string }
  | { type: "saveStart" }
  | { type: "saveSuccess" }
  | { type: "saveError"; error: string }
  | { type: "setCopied"; copied: boolean };

const initialPanelState: PanelState = {
  status: "idle",
  response: null,
  error: null,
  copied: false,
  saved: false,
};

function panelReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action.type) {
    case "loadStored":
      return { ...state, status: "idle", response: action.response, error: null, saved: action.saved || state.saved };
    case "loadFailed":
      return { ...state, status: "error", error: action.error };
    case "resetForPreset":
      return { ...state, status: "idle", response: null, error: null, saved: false };
    case "runStart":
      return { ...state, status: "loading", response: null, error: null, copied: false, saved: false };
    case "runSuccess":
      return { ...state, status: "idle", response: action.response };
    case "runError":
      return { ...state, status: "error", error: action.error };
    case "saveStart":
      return { ...state, status: "saving" };
    case "saveSuccess":
      return { ...state, status: "idle", saved: true };
    case "saveError":
      return { ...state, status: "error", error: action.error };
    case "setCopied":
      return { ...state, copied: action.copied };
    default:
      return state;
  }
}

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
  const [state, dispatch] = useReducer(panelReducer, initialPanelState);
  const { status, response, error, copied, saved } = state;
  const loading = status === "loading";
  const saving = status === "saving";

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
          dispatch({
            type: "loadStored",
            response: { ...(savedData as AiResponse), provider: (savedData as AiResponse).provider || "saved" },
            saved: true,
          });
          onSaved?.();
          return;
        }
      } catch (err) {
        console.error("Failed to parse initialSummary:", err);
        dispatch({ type: "loadFailed", error: "保存済みのAI回答を読み込めませんでした。" });
      }
    }

    if (cacheKey) {
      const cached = loadCache(cacheKey);
      if (cached) {
        dispatch({ type: "loadStored", response: cached, saved: false });
      }
    }
  }, [cacheKey, initialSummary, onSaved]);

  useEffect(() => {
    if (!presetKey) return;
    if (saved && saveUrl) return;
    setInput(presetText ?? "");
    dispatch({ type: "resetForPreset" });
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
    dispatch({ type: "runStart" });
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
      dispatch({ type: "runSuccess", response: data });
      if (cacheKey) saveCache(cacheKey, data);
    } catch (err) {
      dispatch({ type: "runError", error: (err as Error).message });
    }
  };

  const handleSave = async () => {
    if (!response || !saveUrl || !saveId) return;
    dispatch({ type: "saveStart" });
    try {
      const res = await fetch(saveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: saveId, summary: JSON.stringify(response) }),
      });
      if (!res.ok) throw new Error("保存に失敗しました。");
      dispatch({ type: "saveSuccess" });
      onSaved?.();
    } catch (err) {
      console.error("Save failed:", err);
      dispatch({ type: "saveError", error: "保存に失敗しました。再度お試しください。" });
    }
  };

  const handleCopy = async () => {
    if (!response) return;
    const text = buildCopyText(response);
    try {
      await navigator.clipboard.writeText(text);
      dispatch({ type: "setCopied", copied: true });
      setTimeout(() => dispatch({ type: "setCopied", copied: false }), 1500);
    } catch (err) {
      console.error("copy failed", err);
    }
  };

  const overlay = loading || saving;

  return (
    <>
      {overlay ? <BlockingOverlay message="AI処理中です。画面を閉じずにお待ちください。" /> : null}
      <div className="relative rounded-xl border border-[#3f3f46] bg-[#111111] p-5 text-sm text-white">
        {showOneShotNotice ? (
          <div className="mb-3 rounded-md border border-[#3f3f46] bg-[#1a1a1a] px-3 py-2 text-[11px] font-semibold text-yellow-200">
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
            className="sidebar-link-style text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "送信中..." : saved && !!saveUrl ? "保存済み" : "AIに送る"}
          </button>
        </div>

        {error ? <p className="mt-2 text-[11px] text-rose-300">Error: {error}</p> : null}

        {response ? (
          <div className="mt-3 space-y-3 rounded-md border border-[#3f3f46] bg-[#1a1a1a] p-3">
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
                    className="sidebar-link-style text-[11px] disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="sidebar-link-style text-[11px]"
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
