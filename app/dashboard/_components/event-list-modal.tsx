"use client";

import { useMemo, useState } from "react";

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  company?: string | null;
  type: "es" | "interview" | "intern" | "other";
  time?: string | null;
};

type Props = {
  events: CalendarEvent[];
  trigger: React.ReactNode;
};

export function EventListModal({ events, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const sorted = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return [...events]
      .filter((evt) => {
        const d = evt.date ? new Date(evt.date) : null;
        return d ? d >= now : false;
      })
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return da - db;
      });
  }, [events]);

  const visible = sorted.slice(0, visibleCount);
  const canLoadMore = visibleCount < sorted.length;

  return (
    <>
      <div onClick={() => setOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpen(true)}>
        {trigger}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">締切・面接の一覧</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-[70vh] overflow-y-auto space-y-2">
              {visible.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                    <span className="font-semibold">
                      {evt.type === "es" ? "ES締切" : evt.type === "interview" ? "面接" : "予定"}
                    </span>
                    <span>{evt.date || "未設定"}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {evt.company || evt.title || "件名未設定"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">{evt.title}</p>
                </div>
              ))}

              {visible.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                  表示できる予定はありません。
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-300">
                {visible.length} / {sorted.length} 件
              </div>
              <div className="flex gap-2">
                {canLoadMore && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + 10)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    さらに読み込む
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
