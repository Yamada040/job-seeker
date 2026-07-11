"use client";

import Image from "next/image";
import {
  Suspense,
  use,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  computeLevel,
  levelThresholds,
  XP_PER_LEVEL,
} from "@/lib/xp/compute-level";
import {
  consumeXpStatusCookie,
  XP_UPDATED_EVENT,
} from "@/lib/xp/level-up-signal";

export type ProfileLite = {
  userId: string | null;
  xp: number | null;
  level: number | null;
};

const PROFILE_CACHE_KEY = "profile-lite";
const profileCacheKey = (userId: string) => `profile-lite:${userId}`;

const subscribeNoop = () => () => {};

function cacheProfile(profile: ProfileLite | null) {
  try {
    sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile ?? null));
    if (profile?.userId) {
      sessionStorage.setItem(
        profileCacheKey(profile.userId),
        JSON.stringify(profile)
      );
    }
  } catch {
    // fail silently
  }
}

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

  return (
    <XpBadgeView
      key={`${data?.userId ?? "guest"}:${data?.xp ?? 0}:${data?.level ?? 0}`}
      data={data}
    />
  );
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

  return <XpBadgeStatus data={cached} />;
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
  const [displayData, setDisplayData] = useState<ProfileLite | null>(data);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  useEffect(() => {
    cacheProfile(displayData);
  }, [displayData]);

  useEffect(() => {
    const applyXpStatus = () => {
      const status = consumeXpStatusCookie();
      if (!status) return;

      const profile: ProfileLite = {
        userId: data?.userId ?? null,
        xp: status.xp,
        level: status.level,
      };
      setDisplayData(profile);
      if (status.leveledUp) {
        setLevelUp(status.leveledUp);
      }
    };

    applyXpStatus();
    window.addEventListener(XP_UPDATED_EVENT, applyXpStatus);
    return () => window.removeEventListener(XP_UPDATED_EVENT, applyXpStatus);
  }, [data?.userId]);

  return (
    <>
      <XpBadgeStatus data={displayData} />

      {/* 2. レベルアップ演出：モーダル（全画面中央） */}
      {levelUp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
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

                <div className="space-y-4 text-center">
                  <p className="text-xl font-bold leading-relaxed text-white">
                    おめでとう！
                    <br />
                    あなたは Lv.{levelUp} に なった！
                  </p>

                  <button
                    type="button"
                    className="group flex w-full items-center justify-center gap-2 text-2xl font-bold text-white transition hover:text-yellow-400"
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

function XpBadgeStatus({ data }: { data: ProfileLite | null }) {
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
      <div className="flex min-w-[180px] flex-1 flex-col gap-1">
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
  );
}
