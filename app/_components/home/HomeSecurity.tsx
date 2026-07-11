import { motion } from "framer-motion";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

import { fadeInUp } from "./animations";

export function HomeSecurity() {
  return (
    <motion.section
      {...fadeInUp}
      className="rounded-2xl border border-white/70 bg-white/80 p-8 shadow-lg backdrop-blur"
    >
      <div className="flex items-center justify-center gap-3 text-emerald-700">
        <ShieldCheckIcon className="h-6 w-6" />
        <p className="font-semibold">安全・安心なデータ管理</p>
      </div>
      <div className="mt-4 grid gap-3 text-center text-sm text-slate-600 md:grid-cols-3">
        <div>
          <strong className="text-slate-900">暗号化通信</strong>
          <br />
          全ての通信はSSLで保護
        </div>
        <div>
          <strong className="text-slate-900">データ保護</strong>
          <br />
          個人情報は厳格に管理
        </div>
        <div>
          <strong className="text-slate-900">セキュア認証</strong>
          <br />
          メール認証で安全ログイン
        </div>
      </div>
    </motion.section>
  );
}
