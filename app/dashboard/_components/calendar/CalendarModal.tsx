import clsx from "clsx";
import { PlusIcon } from "@heroicons/react/24/outline";

import { TYPE_LABEL } from "./constants";
import { CalendarEvent, CalendarFormState } from "./types";

type Props = {
  selectedDate: string;
  eventsByDate: Record<string, CalendarEvent[]>;
  formState: CalendarFormState;
  editingId: string | null;
  saving: boolean;
  onClose: () => void;
  onNew: () => void;
  onEdit: (evt: CalendarEvent) => void;
  onClear: () => void;
  onDateChange: (value: string) => void;
  onFormChange: (next: Partial<CalendarFormState>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function CalendarModal({
  selectedDate,
  eventsByDate,
  formState,
  editingId,
  saving,
  onClose,
  onNew,
  onEdit,
  onClear,
  onDateChange,
  onFormChange,
  onSubmit,
}: Props) {
  const eventsForDate = eventsByDate[selectedDate] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">選択した日の予定</h3>
            <p className="text-xs text-slate-500">{selectedDate}</p>
          </div>
          <button
            type="button"
            className="text-sm text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onNew}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <PlusIcon className="h-4 w-4" />
            新しい予定を追加
          </button>
        </div>

        <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800">
          {eventsForDate.length ? (
            eventsForDate.map((evt) => (
              <div
                key={evt.id}
                className={clsx(
                  "rounded-lg px-3 py-2",
                  evt.type === "es" && "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-100",
                  evt.type === "interview" &&
                    "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-100",
                  evt.type === "intern" &&
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100",
                  evt.type === "other" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                )}
              >
                <p className="text-xs font-semibold">{TYPE_LABEL[evt.type]}</p>
                <p className="text-sm font-semibold">{evt.company || evt.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {evt.title} {evt.time ? `· ${evt.time}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  {evt.id.startsWith("es-") ? (
                    <a
                      href={`/es/${evt.id.replace("es-", "")}`}
                      className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      ES詳細へ
                    </a>
                  ) : null}
                  {!evt.id.startsWith("es-") && (
                    <button
                      type="button"
                      onClick={() => onEdit(evt)}
                      className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-800 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-100"
                    >
                      予定を編集
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">この日に登録された予定はありません。</p>
          )}
        </div>

        <form className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-slate-300">日付</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-600 dark:text-slate-300">種別</label>
              <select
                value={formState.type}
                onChange={(e) => onFormChange({ type: e.target.value as CalendarEvent["type"] })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="es">ES締切</option>
                <option value="interview">面接</option>
                <option value="intern">インターン</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-600 dark:text-slate-300">時間（任意）</label>
              <input
                type="time"
                value={formState.time}
                onChange={(e) => onFormChange({ time: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-slate-300">企業名</label>
            <input
              type="text"
              value={formState.company}
              onChange={(e) => onFormChange({ company: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              placeholder="例）テック株式会社"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-slate-300">タイトル</label>
            <input
              type="text"
              value={formState.title}
              onChange={(e) => onFormChange({ title: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              placeholder="例）一次面接 / ES締切"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              入力をクリア
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
              disabled={saving}
            >
              <PlusIcon className="h-4 w-4" />
              {saving ? "保存中..." : editingId ? "予定を更新" : "予定を保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
