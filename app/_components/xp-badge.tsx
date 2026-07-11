"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";
import {
  computeLevel,
  levelThresholds,
  XP_PER_LEVEL,
} from "@/lib/xp/compute-level";
import {
  consumeXpStatusCookie,
  XP_UPDATED_EVENT,
} from "@/lib/xp/level-up-signal";

type ProfileLite = {
  xp: number | null;
  level: number | null;
};

// ユーザー切り替え時に前のユーザーのキャッシュを拾わないよう userId でキーを分ける
const profileCacheKey = (userId: string) => `profile-lite:${userId}`;

async function getSessionUserId(): Promise<string | null> {
  // getSession はローカル読みのみでネットワークを伴わない
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id ?? null;
}

export function XpBadge() {
  const [data, setData] = useState<ProfileLite | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  // DB からの取得はセッション初回のみ。以降の XP 変動は awardXp が発行する
  // Cookie（xp / level / leveledUp を含む）から反映するため、再フェッチしない。
  const fetchProfile = useCallback(async () => {
    try {
      const userId = await getSessionUserId();
      if (!userId) return;

      const cached = sessionStorage.getItem(profileCacheKey(userId));
      if (cached) {
        setData(JSON.parse(cached) as ProfileLite | null);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level")
        .eq("id", userId)
        .maybeSingle<ProfileLite>();
      setData(profile ?? null);
      sessionStorage.setItem(
        profileCacheKey(userId),
        JSON.stringify(profile ?? null)
      );
    } catch {
      // fail silently
    }
  }, []);

  // XP付与直後（Server Action / API がセットした Cookie）を検知し、
  // Cookie に載っている付与後の値をそのまま表示へ反映する（DB 再取得なし）。
  // マウント時（redirect で遷移してきたケース）と、同一ページ内で
  // XP付与が完了したことを知らせるカスタムイベントの両方で確認する。
  const applyXpStatus = useCallback(async () => {
    const status = consumeXpStatusCookie();
    if (!status) return false;

    const profile: ProfileLite = { xp: status.xp, level: status.level };
    setData(profile);
    if (status.leveledUp) {
      setLevelUp(status.leveledUp);
    }
    try {
      const userId = await getSessionUserId();
      if (userId) {
        sessionStorage.setItem(
          profileCacheKey(userId),
          JSON.stringify(profile)
        );
      }
    } catch {
      // fail silently
    }
    return true;
  }, []);

  useEffect(() => {
    void (async () => {
      const applied = await applyXpStatus();
      if (!applied) {
        void fetchProfile();
      }
    })();

    const onXpUpdated = () => void applyXpStatus();
    window.addEventListener(XP_UPDATED_EVENT, onXpUpdated);
    return () => window.removeEventListener(XP_UPDATED_EVENT, onXpUpdated);
  }, [applyXpStatus, fetchProfile]);

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
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600"
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
            {/* 背景画像：levelup.jpeg (常駐バーより鮮明に表示) */}
            <Image
              src="/levelup.jpeg"
              alt="Level Up Background"
              fill
              sizes="(max-width: 650px) 100vw, 650px"
              className="object-cover opacity-90"
              priority
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
