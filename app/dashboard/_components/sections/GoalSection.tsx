import Link from "next/link";

import { ROUTES } from "@/lib/constants/routes";

type Props = {
  targetIndustry: string | null | undefined;
  careerAxis: string | null | undefined;
  goalState: string | null | undefined;
};

export function GoalSection({ targetIndustry, careerAxis, goalState }: Props) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">My Goal</p>
      <div className="mt-3 space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          あなたの就活目標をいつでも思い出そう
        </h1>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          志望業界・職種や大切にしたい軸を短く書き留めておくと、日々の行動が目標に結びつきます。
        </p>
        <div className="grid gap-3 md:grid-cols-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <span className="block rounded-2xl bg-amber-50 px-5 py-3 text-amber-800 shadow-sm ring-1 ring-amber-100 dark:bg-amber-900/30 dark:text-amber-100 dark:ring-amber-500/30">
            志望業界: {targetIndustry || "未設定"}
          </span>
          <span className="block rounded-2xl bg-emerald-50 px-5 py-3 text-emerald-800 shadow-sm ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-100 dark:ring-emerald-500/30">
            重視する軸: {careerAxis || "未設定"}
          </span>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-amber-100 via-white to-rose-50 p-5 shadow-lg ring-1 ring-amber-100 dark:from-amber-900/40 dark:via-slate-900 dark:to-rose-900/30 dark:ring-amber-500/30">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-800/30" />
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">Goal Note</p>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-50">{goalState || "未設定"}</p>
          {!goalState && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              プロフィールで「就活で達成したい状態」を短く書いておくと、日々の行動が目標に結びつきます。
            </p>
          )}
        </div>
        <Link href={ROUTES.PROFILE} className="mvp-button mvp-button-secondary inline-flex">
          目標・軸を編集する
        </Link>
      </div>
    </section>
  );
}
