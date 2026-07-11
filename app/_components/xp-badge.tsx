"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";
import {
  computeLevel,
  levelThresholds,
  XP_PER_LEVEL,
} from "@/lib/xp/compute-level";
import {
  consumeLevelUpCookie,
  XP_UPDATED_EVENT,
} from "@/lib/xp/level-up-signal";

type ProfileLite = {
  xp: number | null;
  level: number | null;
};

const PROFILE_CACHE_KEY = "profile-lite";
const PROFILE_CACHE_TS_KEY = "profile-lite-ts";
const CACHE_TTL_MS = 5 * 60 * 1000;

export function XpBadge() {
  const [data, setData] = useState<ProfileLite | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const fetchProfile = useCallback(async (force = false) => {
    try {
      if (!force) {
        const cached = sessionStorage.getItem(PROFILE_CACHE_KEY);
        const cachedAt = Number(
          sessionStorage.getItem(PROFILE_CACHE_TS_KEY) || "0"
        );
        if (cached) {
          const cachedData = JSON.parse(cached) as ProfileLite | null;
          setData(cachedData);
          if (Date.now() - cachedAt < CACHE_TTL_MS) {
            return;
          }
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
      sessionStorage.setItem(
        PROFILE_CACHE_KEY,
        JSON.stringify(profile ?? null)
      );
      sessionStorage.setItem(PROFILE_CACHE_TS_KEY, String(Date.now()));
    } catch {
      // fail silently
    }
  }, []);

  // XP付与直後（Server Action / API がセットした Cookie）を検知して演出を出す。
  // マウント時（redirect で遷移してきたケース）と、同一ページ内で
  // XP付与が完了したことを知らせるカスタムイベントの両方で確認する。
  useEffect(() => {
    const checkXpUpdated = (xpChanged: boolean) => {
      const newLevel = consumeLevelUpCookie();
      if (newLevel) {
        setLevelUp(newLevel);
      }
      // XP付与後は表示中の XP/レベルも最新化する
      void fetchProfile(xpChanged || newLevel !== null);
    };

    checkXpUpdated(false);
    const onXpUpdated = () => checkXpUpdated(true);
    window.addEventListener(XP_UPDATED_EVENT, onXpUpdated);
    return () => window.removeEventListener(XP_UPDATED_EVENT, onXpUpdated);
  }, [fetchProfile]);

  const { xp, level, progress, xpIntoLevel, xpToNext } = useMemo(() => {
    const currentXp = data?.xp ?? 0;
    // DB の level は古い計算式で保存されている可能性があるため、常に XP から導出する
    const lvl = computeLevel(currentXp);
    const { prev, next } = levelThresholds(lvl);
    const into = currentXp - prev;
    return {
      xp: currentXp,
      level: lvl,
      progress: Math.min(1, into / XP_PER_LEVEL),
      xpIntoLevel: into,
      xpToNext: Math.max(0, next - currentXp),
    };
  }, [data]);

  return (
    <>
      {/* 1. 常駐ステータスバー：白基調テーマに合わせた配色 */}
      <div className="flex min-w-[600px] flex-1 items-center gap-4 rounded-md px-2 py-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-bold tracking-widest text-sky-600">
            LEVEL
          </span>
          <span className="theme-readable text-2xl font-bold tracking-tighter">
            Lv {level}
          </span>
          <span className="theme-readable-muted text-xs">XP {xp}</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 min-w-[180px]">
          <div className="h-2.5 w-full rounded-full border border-sky-300 bg-sky-100 p-[2px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-1000"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="theme-readable-muted flex justify-between text-[10px] font-bold tracking-tight">
            <span>つぎの レベルまで {xpToNext} XP</span>
            <span>
              {xpIntoLevel} / {XP_PER_LEVEL}
            </span>
          </div>
        </div>
      </div>

      {/* 2. レベルアップ演出：モーダル（全画面中央） */}
      {levelUp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative aspect-video w-full max-w-[650px] overflow-hidden border-4 border-white shadow-2xl">
            {/* 背景画像：levelup.jpg (常駐バーより鮮明に表示) */}
            <img
              src="/levelup.jpg"
              alt="Level Up Background"
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />

            {/* DQ風メッセージウィンドウ */}
            <div className="absolute inset-x-8 bottom-8">
              <div className="relative rounded-lg border border-[#52525b] bg-[#111111] p-6 shadow-xl">
                {/* 枠に割り込むタイトル */}
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black px-4 text-lg font-bold tracking-widest text-white">
                  LEVEL UP!
                </span>

                <div className="text-center space-y-4">
                  <p className="text-xl font-bold leading-relaxed text-white">
                    おめでとう！
                    <br />
                    あなたは Lv.{levelUp} に なった！
                  </p>

                  <button
                    type="button"
                    className="group flex items-center justify-center w-full gap-2 text-2xl font-bold text-white transition hover:text-yellow-400"
                    onClick={() => setLevelUp(null)}
                  >
                    <span className="animate-pulse">▶</span>
                    <span>つぎへ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
