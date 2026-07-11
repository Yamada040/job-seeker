"use client";

import {
  Suspense,
  use,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

export type ProfileLite = {
  xp: number | null;
  level: number | null;
};

const PROFILE_CACHE_KEY = "profile-lite";

function computeLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 25) + 1);
}

const subscribeNoop = () => () => {};

function readCachedProfileRaw(): string | null {
  try {
    return sessionStorage.getItem(PROFILE_CACHE_KEY);
  } catch {
    return null;
  }
}

/**
 * Server Component から渡された promise を use() で解決して表示する。
 * 解決値は sessionStorage にキャッシュし、ページ遷移中の
 * Suspense fallback（XpBadgeFallback）でのちらつき防止に使う。
 */
function XpBadgeResolved({
  profilePromise,
}: {
  profilePromise: Promise<ProfileLite | null>;
}) {
  const data = use(profilePromise);

  useEffect(() => {
    try {
      sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data ?? null));
    } catch {
      // fail silently
    }
  }, [data]);

  return <XpBadgeView data={data} />;
}

/**
 * Suspense fallback。前回表示時の sessionStorage キャッシュがあれば
 * それを表示してちらつきを防ぐ（初回はデフォルト表示）。
 */
function XpBadgeFallback() {
  // SSR では null（デフォルト表示）、クライアントでは sessionStorage を
  // 参照してハイドレーション不整合なく前回値を表示する。
  const raw = useSyncExternalStore(
    subscribeNoop,
    readCachedProfileRaw,
    () => null
  );

  const cached = useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ProfileLite | null;
    } catch {
      return null;
    }
  }, [raw]);

  return <XpBadgeView data={cached} />;
}

export function XpBadge({
  profilePromise,
}: {
  profilePromise: Promise<ProfileLite | null>;
}) {
  return (
    <Suspense fallback={<XpBadgeFallback />}>
      <XpBadgeResolved profilePromise={profilePromise} />
    </Suspense>
  );
}

function XpBadgeView({ data }: { data: ProfileLite | null }) {
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const { xp, level, progress, nextThreshold } = useMemo(() => {
    const currentXp = data?.xp ?? 0;
    const lvl = data?.level ?? computeLevel(currentXp);
    const prev = Math.max(0, (lvl - 1) * 50);
    const next = lvl * 50;
    const prog =
      next > prev ? Math.min(1, (currentXp - prev) / (next - prev)) : 0;
    return {
      xp: currentXp,
      level: lvl,
      progress: prog,
      nextThreshold: next,
    };
  }, [data]);

  return (
    <>
      {/* 1. 常駐ステータスバー：DQウィンドウ形式に戻す */}
      <div className="flex min-w-[600px] flex-1 items-center gap-4 rounded-md px-2 py-1 text-white">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-bold tracking-widest text-white/90">
            LEVEL
          </span>
          <span className="text-2xl font-bold tracking-tighter text-white">
            Lv {level}
          </span>
          <span className="text-xs text-white/80">XP {xp}</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 min-w-[180px]">
          <div className="h-2.5 w-full border border-white bg-black/40 p-[2px]">
            <div
              className="h-full bg-yellow-300 transition-all duration-1000"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold tracking-tight text-white">
            <span>
              つぎの レベルまで {Math.max(0, nextThreshold - xp)} XP
            </span>
            <span>
              {xp} / {nextThreshold}
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
