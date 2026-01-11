"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";

type ProfileLite = {
  xp: number | null;
  level: number | null;
};

const PROFILE_CACHE_KEY = "profile-lite";
const PROFILE_CACHE_TS_KEY = "profile-lite-ts";
const CACHE_TTL_MS = 5 * 60 * 1000;

function computeLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 25) + 1);
}

export function XpBadge() {
  const [data, setData] = useState<ProfileLite | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cached = sessionStorage.getItem(PROFILE_CACHE_KEY);
        const cachedAt = Number(sessionStorage.getItem(PROFILE_CACHE_TS_KEY) || "0");
        if (cached) {
          const cachedData = JSON.parse(cached) as ProfileLite | null;
          setData(cachedData);
          if (Date.now() - cachedAt < CACHE_TTL_MS) {
            return;
          }
        }

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
        sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile ?? null));
        sessionStorage.setItem(PROFILE_CACHE_TS_KEY, String(Date.now()));
      } catch (e) {
        // fail silently
      }
    };
    void fetchProfile();
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
      <div className="flex min-w-[600px] flex-1 items-center gap-4 rounded-2xl border border-white/80 bg-black/80 px-6 py-3 text-white shadow-[0_0_0_2px_black,0_0_0_4px_white]">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-white/80">LEVEL</span>
          <span className="text-2xl font-bold">Lv.{level}</span>
          <span className="text-sm text-white/70">XP {xp}</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 min-w-[180px]">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-linear-to-r from-yellow-300 to-yellow-500 transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/70">
            <span>次まで {Math.max(0, nextThreshold - xp)} XP</span>
            <span>
              {prevThreshold} / {nextThreshold} XP
            </span>
          </div>
        </div>
      </div>

      {levelUp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="relative flex items-center gap-4 rounded-3xl border border-white/80 bg-black/90 px-6 py-5 text-base font-semibold text-white shadow-[0_0_0_2px_black,0_0_0_4px_white]">
            <span className="rounded-full border border-white/70 bg-black px-3 py-1 text-sm text-white">
              Level Up
            </span>
            <span>おめでとうございます！ Lv.{levelUp} に到達しました</span>
            <button
              type="button"
              aria-label="閉じる"
              className="absolute -right-2 -top-2 h-7 w-7 rounded-full border-2 border-white bg-black text-white shadow-md transition hover:scale-105"
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
