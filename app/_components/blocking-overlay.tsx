"use client";

import { createPortal } from "react-dom";

type BlockingOverlayProps = {
  message?: string;
};

export function BlockingOverlay({ message = "AI処理中です。画面を閉じずにお待ちください。" }: BlockingOverlayProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="rounded-lg border border-[#52525b] bg-[#111111] px-4 py-3 text-sm font-semibold text-white shadow-xl">
        {message}
      </div>
    </div>,
    document.body,
  );
}
