import { AiResponse } from "./types";

type Props = {
  title: string;
  hint?: string;
  cacheKey?: string;
  response: AiResponse | null;
};

export function AiPanelHeader({ title, hint, cacheKey, response }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-amber-700">{title}</p>
        {hint ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-300">
            {hint}
          </p>
        ) : null}
        {cacheKey ? (
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            ※
            1回保存すると再実行はできません。入力を確認してから送信してください。
          </p>
        ) : null}
      </div>
      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
        {response?.provider ?? "AI"}
      </span>
    </div>
  );
}
