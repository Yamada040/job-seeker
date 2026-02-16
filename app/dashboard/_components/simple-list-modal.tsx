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
          <div className="dq-window relative w-full max-w-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">一覧</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-white/70 hover:text-yellow-300"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-[70vh] overflow-y-auto space-y-2">
              {visible.map((item, idx) => (
                <div
                  key={`${item.title}-${idx}`}
                  className="dq-panel px-3 py-2 text-sm"
                >
                  <p className="font-semibold text-white">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-white/70">{item.subtitle}</p>}
                  {item.meta && <p className="text-[11px] text-white/60">{item.meta}</p>}
                </div>
              ))}

              {visible.length === 0 && (
                <div className="dq-panel border-dashed p-3 text-xs text-white/60">
                  {emptyText}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-white/60">
                {visible.length} / {items.length} 件
              </div>
              <div className="flex gap-2">
                {canLoadMore && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + 10)}
                    className="dq-button-secondary text-sm"
                  >
                    さらに読み込む
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="dq-button-secondary text-sm"
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
