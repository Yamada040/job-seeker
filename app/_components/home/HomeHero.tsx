import Link from "next/link";
import { motion } from "framer-motion";

import { ROUTES } from "@/lib/constants/routes";
import { ArrowRightIcon, badges, stats } from "./constants";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-12 shadow-2xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
      <div className="absolute -right-32 -top-24 h-64 w-64 rotate-6 rounded-3xl bg-gradient-to-br from-amber-300/50 via-orange-500/40 to-rose-500/40 blur-3xl" />
      <div className="absolute -left-28 bottom-[-90px] h-64 w-64 rounded-3xl bg-gradient-to-br from-cyan-300/40 via-emerald-300/30 to-white/0 blur-3xl" />

      <div className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${badge.className}`}
              >
                {badge.label}
                <badge.icon className="h-3 w-3" />
              </span>
            ))}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
          >
            就活を<span className="text-amber-500">効率化</span>して
            <span className="block text-slate-700">内定獲得率を上げる</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-2xl text-lg leading-7 text-slate-600"
          >
            AI添削でエントリーシートの質を向上させ、企業管理で選考状況を見える化。
            <br />
            ゲーム感覚で継続できる就活管理プラットフォーム。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href={`${ROUTES.LOGIN}?mode=signup`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-300/40 transition hover:scale-105 hover:shadow-xl"
            >
              無料で始める
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white hover:scale-105"
            >
              機能を見る
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid gap-4"
        >
          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-6 shadow-inner shadow-amber-200/40">
            <p className="text-sm text-amber-600 font-semibold">成功実績</p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-4 grid grid-cols-2 gap-4 text-center"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
                  className="space-y-1"
                >
                  <div className="text-2xl font-bold text-amber-600">{stat.value}</div>
                  <div className="text-xs text-slate-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
