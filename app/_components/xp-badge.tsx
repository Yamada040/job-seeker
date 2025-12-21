"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";

type ProfileLite = {
  xp: number | null;
  level: number | null;
};

function computeLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 25) + 1);
}

export function XpBadge() {
  const [data, setData] = useState<ProfileLite | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("xp, level")
          .eq("id", userId)
          .maybeSingle<ProfileLite>();
        setData(profile ?? null);
      } catch (e) {
        // fail silently
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!data) return;
    const currentLevel = data.level ?? computeLevel(data.xp ?? 0);
    const stored = Number(localStorage.getItem("lastLevel") || "0");
    if (currentLevel > stored) {
      setLevelUp(currentLevel);
      localStorage.setItem("lastLevel", String(currentLevel));
      const timer = window.setTimeout(() => setLevelUp(null), 4000);
      return () => window.clearTimeout(timer);
    }
    return;
  }, [data]);

  const { xp, level, progress, nextThreshold, prevThreshold } = useMemo(() => {
    const currentXp = data?.xp ?? 0;
    const lvl = data?.level ?? computeLevel(currentXp);
    const prev = Math.max(0, (lvl - 1) * 50);
    const next = lvl * 50;
    const prog = next > prev ? Math.min(1, (currentXp - prev) / (next - prev)) : 0;
    return { xp: currentXp, level: lvl, progress: prog, nextThreshold: next, prevThreshold: prev };
  }, [data]);

  return (
    <>
      <div className="flex min-w-[600px] flex-1 items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-3 text-amber-900 shadow-sm dark:border-amber-500/40 dark:bg-amber-900/30 dark:text-amber-50">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold">Level</span>
          <span className="text-2xl font-bold">Lv.{level}</span>
          <span className="text-sm text-amber-700 dark:text-amber-200">XP {xp}</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 min-w-[180px]">
          <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100/80 dark:bg-amber-800/50">
            <div
              className="h-full rounded-full bg-linear-to-r from-amber-400 to-rose-400 transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-amber-800/80 dark:text-amber-100/80">
            <span>次まで {Math.max(0, nextThreshold - xp)} XP</span>
            <span>
              {prevThreshold} / {nextThreshold} XP
            </span>
          </div>
        </div>
      </div>

      {levelUp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="relative flex items-center gap-4 rounded-3xl border border-amber-300 bg-white/95 px-6 py-5 text-base font-semibold text-amber-800 shadow-2xl dark:border-amber-500/50 dark:bg-amber-900/90 dark:text-amber-50">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700 dark:bg-amber-800 dark:text-amber-100">
              Level Up
            </span>
            <span>おめでとうございます！ Lv.{levelUp} に到達しました</span>
            <button
              type="button"
              aria-label="閉じる"
              className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-amber-500 text-white shadow-md transition hover:scale-105"
              onClick={() => setLevelUp(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
