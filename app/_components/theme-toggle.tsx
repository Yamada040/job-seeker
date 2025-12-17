"use client";

import { useMemo } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useAppTheme } from "@/app/theme-provider";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useAppTheme();

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";
  const label = useMemo(() => (isDark ? "ダーク" : "ライト"), [isDark]);
  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="テーマ切り替え"
      className={clsx(
        "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
        isDark
          ? "border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
      )}
    >
      {isDark ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      <span>{label}</span>
    </button>
  );
}
