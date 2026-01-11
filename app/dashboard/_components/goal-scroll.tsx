import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

type GoalScrollProps = {
  targetIndustry?: string | null;
  careerAxis?: string | null;
  goalState?: string | null;
};

export function GoalScroll({
  targetIndustry,
  careerAxis,
  goalState,
}: GoalScrollProps) {
  return (
    <section className="relative pb-6 pt-6">
      <div className="relative mx-auto w-[min(96%,1000px)]">
        {/* 1. 縦幅を抑えた横長の巻き物コンテナ */}
        <div className="relative aspect-[2048/750] w-full drop-shadow-lg">
          <img
            src="/parchment.png"
            alt="巻物"
            className="absolute inset-0 h-full w-full object-fill opacity-95"
          />

          {/* 2. コンテンツエリア：高さを抑えて情報の密度を上げる */}
          <div className="absolute inset-0 z-10 flex flex-col justify-center px-16 py-4 md:px-32">
            {/* 上部：タイトルと編集リンクを一行にまとめてスペース節約 */}
            <div className="mb-2 flex items-end justify-between border-b border-[#3e2a16]/20 pb-1">
              <h1
                className="text-lg font-black text-[#3e2a16] md:text-2xl"
                style={{ textShadow: "1px 1px 0px rgba(255,255,255,0.4)" }}
              >
                ▼ 現在の目標
              </h1>
              <div className="flex items-center justify-between pt-2">
                <Link
                  href={ROUTES.PROFILE}
                  className="group flex items-center text-xs font-black text-[#111111] transition-colors hover:text-[#000000]"
                >
                  <span className="mr-1 inline-block transition-transform group-hover:translate-x-1">
                    ▶
                  </span>
                  目標・軸を編集する
                </Link>
              </div>
            </div>

            {/* 3. 志望・軸を横並び、その下に目標 */}
            <div className="space-y-3">
              <div className="grid gap-x-10 gap-y-2 md:grid-cols-2">
                <div className="flex items-baseline gap-2">
                  <span className="shrink-0 text-[10px] font-bold text-[#7d5a2a]">
                    【志望】
                  </span>
                  <p className="truncate text-base font-black text-[#3e2a16] md:text-xl">
                    {targetIndustry || "未設定"}
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="shrink-0 text-[10px] font-bold text-[#7d5a2a]">
                    【軸】
                  </span>
                  <p className="truncate text-base font-black text-[#3e2a16] md:text-xl">
                    {careerAxis || "未設定"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center rounded-md bg-[#3e2a16]/5 px-4 py-2">
                <span className="mb-1 text-[9px] font-bold text-[#7d5a2a] opacity-70 uppercase tracking-tighter">
                  Goal Note
                </span>
                <p className="text-sm font-black italic leading-tight text-[#2a1a0a] md:text-lg">
                  「{goalState || "未設定の目標"}」
                </p>
              </div>
            </div>

            {/* 4. キャラクター：さらに小さく配置して邪魔にならないように */}
            <img
              src="/retro-hero.svg"
              alt="勇者"
              className="pointer-events-none absolute -bottom-2 right-12 hidden h-28 w-28 drop-shadow-md md:block pixel-art"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
