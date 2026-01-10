import Link from "next/link";
import { motion } from "framer-motion";

import { ROUTES } from "@/lib/constants/routes";
import { fadeInUp } from "./animations";
import { ArrowRightIcon } from "./constants";

export function HomeCta() {
  return (
    <motion.section
      {...fadeInUp}
      className="rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-100/80 via-amber-50/90 to-white p-12 text-center shadow-xl"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <h2 className="text-3xl font-bold text-slate-900">今すぐ就活を効率化しませんか？</h2>
        <p className="text-lg text-slate-700">
          無料で始められます。面倒な設定は不要で、登録後すぐに利用可能です。
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={`${ROUTES.LOGIN}?mode=signup`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-8 py-4 text-lg font-semibold text-slate-900 shadow-lg shadow-amber-300/40 transition hover:shadow-xl"
            >
              無料で始める
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-8 py-4 text-lg font-semibold text-slate-800 transition hover:bg-white"
            >
              ログイン
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
