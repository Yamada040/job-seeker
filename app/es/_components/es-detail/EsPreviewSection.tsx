import { Entry } from "./types";
import { EsAiPanelCard } from "./EsAiPanelCard";

type Props = {
  entry: Entry;
  combinedContent: string;
  onEdit: () => void;
};

export function EsPreviewSection({ entry, combinedContent, onEdit }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
      <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="space-y-4 text-sm text-slate-800">
          <div>
            <p className="text-xs text-slate-600">企業名</p>
            <p className="rounded-lg border border-slate-200 bg-white px-3 py-2">{entry.company_name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">タイトル</p>
            <p className="rounded-lg border border-slate-200 bg-white px-3 py-2">{entry.title || "-"}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-600">職種 / 募集枠</p>
              <p className="rounded-lg border border-slate-200 bg-white px-3 py-2">{entry.selection_status || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">締切日</p>
              <p className="rounded-lg border border-slate-200 bg-white px-3 py-2">{entry.deadline || "-"}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-600">企業URL</p>
              <p className="break-all rounded-lg border border-slate-200 bg-white px-3 py-2">
                {entry.company_url || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">メモ</p>
              <p className="rounded-lg border border-slate-200 bg-white px-3 py-2">{entry.memo || "-"}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-slate-600">本文</p>
            <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
              {entry.content_md || "-"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.status === "submitted" && (
              <button type="button" onClick={onEdit} className="mvp-button mvp-button-primary">
                編集する
              </button>
            )}
          </div>
        </div>
      </div>
      <EsAiPanelCard entry={entry} combinedContent={combinedContent} />
    </div>
  );
}
