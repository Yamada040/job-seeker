import Link from "next/link";
import { motion } from "framer-motion";

import { ROUTES } from "@/lib/constants/routes";

export function HomeHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2 text-lg font-semibold">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-sm font-bold text-slate-900 shadow-md shadow-amber-300/40">
          就
        </span>
        <span>就活Copilot</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <Link
          href={ROUTES.LOGIN}
          className="rounded-full border border-white/70 bg-white/80 px-4 py-2 font-semibold text-slate-800 shadow-sm transition hover:bg-white hover:scale-105"
        >
          ログイン
        </Link>
        <Link
          href={`${ROUTES.LOGIN}?mode=signup`}
          className="rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-2 font-semibold text-slate-900 shadow-lg shadow-amber-300/40 transition hover:scale-105 hover:shadow-xl"
        >
          無料で始める
        </Link>
      </div>
    </motion.header>
  );
}
