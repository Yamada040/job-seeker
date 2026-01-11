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
      className={clsx("dq-button-secondary text-xs", isDark && "border-white/70")}
    >
      {isDark ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      <span>{label}</span>
    </button>
  );
}
