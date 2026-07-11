"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CheckIcon, ClipboardDocumentIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { BlockingOverlay } from "@/app/_components/blocking-overlay";

type AiResponse = {
  summary?: string;
  bulletPoints?: string[];
  provider?: string;
  error?: string;
};

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

const sanitizeMarkdown = (text: string): string =>
  text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/^#+\s/gm, "");

type InitialState = { response: AiResponse | null; saved: boolean };

function resolveInitialState(initialSummary: unknown, cacheKey?: string): InitialState {
  if (initialSummary) {
    try {
      const parsed =
        typeof initialSummary === "string" ? JSON.parse(initialSummary) : initialSummary;
      if ((parsed as AiResponse).summary) {
        return {
          response: { ...(parsed as AiResponse), provider: (parsed as AiResponse).provider ?? "saved" },
          saved: true,
        };
      }
    } catch { /* ignore */ }
  }
  if (cacheKey && typeof window !== "undefined") {
    const stored = sessionStorage.getItem(`ai-cache-${cacheKey}`);
    if (stored) {
      try { return { response: JSON.parse(stored) as AiResponse, saved: false }; } catch { /* ignore */ }
    }
  }
  return { response: null, saved: false };
}

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

  const [input, setInput] = useState(aiInput);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [{ response: initialResponse, saved: initialSaved }] = useState(
    () => resolveInitialState(initialSummary, cacheKey)
  );
  const [response, setResponse] = useState<AiResponse | null>(initialResponse);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(initialSaved);
  const [progressLog, setProgressLog] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isPending || saving) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isPending, saving]);

  const handleRun = () => {
    if (saved && saveUrl) return;
    startTransition(async () => {
      setError(null);
      setResponse(null);
      setCopied(false);
      setSaved(false);
      setProgressLog([]);

      try {
        const res = await fetch("/api/ai/company/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
        });

        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "AI呼び出しに失敗しました。");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";

          for (const chunk of chunks) {
            if (!chunk.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(chunk.slice(6)) as {
                type: "progress" | "result" | "error";
                message?: string;
                summary?: string;
                bulletPoints?: string[];
                provider?: string;
              };
              if (event.type === "progress" && event.message) {
                setProgressLog((prev) => [...prev, event.message!]);
              } else if (event.type === "result") {
                const result: AiResponse = {
                  summary: event.summary,
                  bulletPoints: event.bulletPoints,
                  provider: event.provider,
                };
                setResponse(result);
                if (cacheKey) sessionStorage.setItem(`ai-cache-${cacheKey}`, JSON.stringify(result));
              } else if (event.type === "error") {
                throw new Error(event.message ?? "エラーが発生しました。");
              }
            } catch (parseErr) {
              if (parseErr instanceof SyntaxError) continue;
              throw parseErr;
            }
          }
        }
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const handleSave = async () => {
    if (!response || !saveUrl || !saveId) return;
    setSaving(true);
    try {
      const res = await fetch(saveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: saveId, summary: JSON.stringify(response) }),
      });
      if (!res.ok) throw new Error("保存に失敗しました。");
      setSaved(true);
    } catch (err) {
      setError("保存に失敗しました。再度お試しください。");
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!response) return;
    const text = [
      response.summary ?? "",
      ...(response.bulletPoints?.map((b) => `・${b}`) ?? []),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  const wordCount = useMemo(() => input.split(/\s+/).filter(Boolean).length, [input]);
  const overlay = isPending || saving;

  return (
    <>
      {overlay ? <BlockingOverlay message="AI処理中です。画面を閉じずにお待ちください。" /> : null}
      <div className="relative rounded-xl border border-[#3f3f46] bg-[#111111] p-5 text-sm text-white">
        <div className="mb-3 rounded-md border border-[#3f3f46] bg-[#1a1a1a] px-3 py-2 text-[11px] font-semibold text-yellow-200">
          ※ 保存済みのAI回答は再実行できません。再度利用したい場合は運営にお問い合わせください。
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-yellow-200">AI企業要約（Web検索付き）</p>
            <p className="text-[11px] text-white/70">
              企業HPや採用情報をリアルタイムで検索し、最新情報をもとに概要・求める人物像を要約します。
            </p>
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
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleRun}
            disabled={isPending || (saved && !!saveUrl)}
            className="sidebar-link-style text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "検索・分析中..." : saved && !!saveUrl ? "保存済み" : "AIに送る"}
          </button>
        </div>

        {isPending && progressLog.length > 0 ? (
          <div className="mt-2 space-y-1 rounded-md border border-[#3f3f46] bg-[#1a1a1a] p-3">
            {progressLog.map((msg, i) => (
              <p key={i} className="text-[11px] text-white/60">
                ▶ {msg}
              </p>
            ))}
          </div>
        ) : null}

        {error ? <p className="mt-2 text-[11px] text-rose-300">Error: {error}</p> : null}

        {response ? (
          <div className="mt-3 space-y-3 rounded-md border border-[#3f3f46] bg-[#1a1a1a] p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-yellow-200">
                AI回答 {response.provider === "saved" ? "（保存済み）" : ""}
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
