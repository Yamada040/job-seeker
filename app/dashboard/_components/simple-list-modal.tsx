"use client";

import { useState } from "react";

type Item = {
  title: string;
  subtitle?: string;
  meta?: string;
};

type Props = {
  trigger: React.ReactNode;
  items: Item[];
  emptyText?: string;
};

export function SimpleListModal({ trigger, items, emptyText = "項目がありません" }: Props) {
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const visible = items.slice(0, visibleCount);
  const canLoadMore = visibleCount < items.length;

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
      >
        {trigger}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">一覧</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-[70vh] overflow-y-auto space-y-2">
              {visible.map((item, idx) => (
                <div
                  key={`${item.title}-${idx}`}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-slate-600 dark:text-slate-300">{item.subtitle}</p>}
                  {item.meta && <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.meta}</p>}
                </div>
              ))}

              {visible.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                  {emptyText}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-300">
                {visible.length} / {items.length} 件
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
