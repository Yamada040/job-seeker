"use client";

import { createPortal } from "react-dom";

type BlockingOverlayProps = {
  message?: string;
};

export function BlockingOverlay({ message = "処理中です..." }: BlockingOverlayProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
      <div className="rounded-xl bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg dark:bg-slate-900/90 dark:text-slate-100">
        {message}
      </div>
    </div>,
    document.body
  );
}
