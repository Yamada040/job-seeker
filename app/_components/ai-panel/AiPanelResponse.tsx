import { CheckIcon, ClipboardDocumentIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

import { AiResponse } from "./types";
import { sanitizeMarkdown } from "./utils";

type Props = {
  response: AiResponse;
  saveUrl?: string;
  saveId?: string;
  saved: boolean;
  saving: boolean;
  copied: boolean;
  onSave: () => void;
  onCopy: () => void;
};

export function AiPanelResponse({ response, saveUrl, saveId, saved, saving, copied, onSave, onCopy }: Props) {
  return (
    <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-amber-700">
          AI回答 {response?.provider === "saved" ? "（保存済み）" : ""}
        </p>
        <div className="flex gap-2">
          {saveUrl && saveId && !saved && (
            <button
              type="button"
              onClick={onSave}
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
            onClick={onCopy}
            className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-white dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
            <span>{copied ? "コピー済み" : "コピー"}</span>
          </button>
        </div>
      </div>
      <div className="whitespace-pre-line text-sm leading-6 text-slate-800 dark:text-slate-100">
        {response.summary ? sanitizeMarkdown(response.summary) : "回答がまだありません。"}
      </div>
      {response.bulletPoints?.length ? (
        <ul className="list-disc space-y-1 pl-4 text-sm text-slate-800 dark:text-slate-100">
          {response.bulletPoints.map((b, idx) => (
            <li key={`${idx}-${b}`}>{sanitizeMarkdown(b)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
