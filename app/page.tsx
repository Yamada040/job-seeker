"use client";

import Link from "next/link";
import { 
  ArrowRightIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  PencilSquareIcon,
  BuildingOffice2Icon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

import { ROUTES } from "@/lib/constants/routes";

const features = [
  {
    icon: PencilSquareIcon,
    title: "AI ES添削",
    description: "GPT・Geminiによる高品質な添削で、通過率の高いエントリーシートを作成",
    benefit: "添削時間を80%短縮"
  },
  {
    icon: BuildingOffice2Icon,
    title: "企業管理",
    description: "選考状況、志望度、メモを一元管理。進捗を見える化して効率的に就活",
    benefit: "管理工数を50%削減"
  },
  {
    icon: ChartBarIcon,
    title: "進捗可視化",
    description: "ゲーム感覚でタスクをこなし、XPとレベルで成長を実感できる仕組み",
    benefit: "継続率を3倍向上"
  },
];

const steps = [
  {
    step: "01",
    title: "アカウント作成",
    description: "メールアドレスだけで簡単登録。30秒で始められます。"
  },
  {
    step: "02", 
    title: "企業・ES登録",
    description: "志望企業とエントリーシートを登録して管理開始。"
  },
  {
    step: "03",
    title: "AI活用で効率化",
    description: "添削機能で質を向上、進捗管理で確実に内定獲得へ。"
  },
];

const stats = [
  { value: "80%", label: "添削時間短縮" },
  { value: "3倍", label: "継続率向上" },
  { value: "50%", label: "管理工数削減" },
  { value: "100+", label: "活用中の学生" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {

  return (
    <div className="relative min-h-screen overflow-hidden text-white">

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-10 sm:px-10 sm:py-14">
        {/* ヘッダー */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#52525b] bg-[#111111] text-sm font-bold text-white">
              就
            </span>
            <span>就活Copilot</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href={ROUTES.LOGIN}
              className="dq-button-secondary"
            >
              ログイン
            </Link>
            <Link
              href={`${ROUTES.LOGIN}?mode=signup`}
              className="dq-button"
            >
              無料で始める
            </Link>
          </div>
        </motion.header>

        {/* ヒーロー */}
        <section className="dq-window relative overflow-hidden p-10">
          <div className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-200">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/60 px-3 py-1">
                  AI活用
                  <SparklesIcon className="h-3 w-3 text-yellow-200" />
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/60 px-3 py-1 text-emerald-200">
                  無料で始められる
                  <CheckCircleIcon className="h-3 w-3 text-emerald-200" />
                </span>
              </div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
              >
                就活を<span className="text-yellow-300">効率化</span>して
                <span className="block text-white/80">内定獲得率を上げる</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="max-w-2xl text-lg leading-7 text-white/70"
              >
                AI添削でエントリーシートの質を向上させ、企業管理で選考状況を見える化。<br />
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
                  className="dq-button"
                >
                  無料で始める
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="#features"
                  className="dq-button-secondary"
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
              <div className="dq-panel p-6">
                <p className="text-sm font-semibold text-yellow-200">成功実績</p>
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
                      <div className="text-2xl font-bold text-yellow-300">{stat.value}</div>
                      <div className="text-xs text-white/70">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 機能セクション */}
        <section id="features" className="space-y-8">
          <motion.div
            {...fadeInUp}
            className="text-center space-y-3"
          >
            <h2 className="text-3xl font-bold text-white">就活を変える3つの機能</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              AI技術と効率的な管理機能で、就活の成功確率を大幅に向上させます
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                className="dq-card p-8 transition-all duration-300"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#52525b] bg-[#111111] text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 mb-4 leading-6">{feature.description}</p>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/60 px-3 py-1 text-sm font-medium text-emerald-200">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-200" />
                  {feature.benefit}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 始め方セクション */}
        <section className="space-y-8">
          <motion.div
            {...fadeInUp}
            className="text-center space-y-3"
          >
            <h2 className="text-3xl font-bold text-white">簡単3ステップで始める</h2>
            <p className="text-lg text-white/70">
              面倒な設定は一切不要。今すぐ就活効率化を体験してください
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-3"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={fadeInUp}
                className="dq-card relative p-6 text-center"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#52525b] bg-[#111111] text-lg font-bold text-white">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/70 text-sm">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden md:block">
                    <ArrowRightIcon className="h-6 w-6 text-yellow-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA */}
        <motion.section
          {...fadeInUp}
          className="dq-window p-10 text-center"
        >
          <div className="mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-bold text-white">
              今すぐ就活を効率化しませんか？
            </h2>
            <p className="text-lg text-white/70">
              無料で始められます。面倒な設定は不要で、登録後すぐに利用可能です。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={`${ROUTES.LOGIN}?mode=signup`}
                  className="dq-button"
                >
                  無料で始める
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={ROUTES.LOGIN}
                  className="dq-button-secondary"
                >
                  ログイン
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* セキュリティ */}
        <motion.section
          {...fadeInUp}
          className="dq-window p-8"
        >
          <div className="flex items-center justify-center gap-3 text-emerald-200">
            <ShieldCheckIcon className="h-6 w-6" />
            <p className="font-semibold">安全・安心なデータ管理</p>
          </div>
          <div className="mt-4 grid gap-3 text-center text-sm text-white/70 md:grid-cols-3">
            <div>
              <strong className="text-white">暗号化通信</strong>
              <br />全ての通信はSSLで保護
            </div>
            <div>
              <strong className="text-white">データ保護</strong>
              <br />個人情報は厳格に管理
            </div>
            <div>
              <strong className="text-white">セキュア認証</strong>
              <br />メール認証で安全ログイン
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
