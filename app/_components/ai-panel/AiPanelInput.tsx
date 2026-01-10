type Props = {
  input: string;
  onChange: (value: string) => void;
  wordCount: number;
  hint?: string;
  loading: boolean;
  saved: boolean;
  saveUrl?: string;
  onRun: () => void;
};

export function AiPanelInput({
  input,
  onChange,
  wordCount,
  hint,
  loading,
  saved,
  saveUrl,
  onRun,
}: Props) {
  return (
    <>
      <textarea
        value={input}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300">
        <span>単語数: {wordCount}</span>
        {hint ? <span>{hint}</span> : null}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onRun}
          disabled={loading || (saved && !!saveUrl)}
          className="rounded-full bg-linear-to-r from-emerald-300 via-cyan-300 to-sky-300 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 transition hover:translate-y-0.5 hover:shadow-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "送信中..." : saved && !!saveUrl ? "保存済み" : "AIに送る"}
        </button>
      </div>
    </>
  );
}
