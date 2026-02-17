"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const STORAGE_KEY = "ui-theme";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("theme-dark", "theme-light");
  root.classList.add(mode === "light" ? "theme-light" : "theme-dark");
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial: ThemeMode = stored === "light" ? "light" : "dark";
    applyTheme(initial);
    setMode(initial);
    setReady(true);
  }, []);

  const handleToggle = () => {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    setMode(next);
  };

  return (
    <div className="theme-switch-wrap">
      <p className="theme-switch-title">THEME</p>
      <button
        type="button"
        onClick={handleToggle}
        className="theme-switch"
        aria-label={mode === "dark" ? "ライトモードへ切り替え" : "ダークモードへ切り替え"}
        aria-pressed={mode === "light"}
        disabled={!ready}
      >
        <span className="theme-switch-text">{mode === "dark" ? "DARK" : "LIGHT"}</span>
        <span className="theme-switch-thumb" />
      </button>
    </div>
  );
}
