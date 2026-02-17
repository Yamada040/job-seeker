"use client";

import Link from "next/link";
import { 
  ArrowRightIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  PencilSquareIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  LifebuoyIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

import { ROUTES } from "@/lib/constants/routes";
import { BrandLogo } from "./_components/layout/BrandLogo";

const features = [
  {
    icon: PencilSquareIcon,
    title: "AI ES添削",
    description: "GPT・Geminiによる高品質な添削で、通過率の高いエントリーシートを作成",
    benefit: "伝わるESに磨き上げる"
  },
  {
    icon: BuildingOffice2Icon,
    title: "企業管理",
    description: "選考状況、志望度、メモを一元管理。進捗を見える化して効率的に就活",
    benefit: "抜け漏れを防いで前進できる"
  },
  {
    icon: ChartBarIcon,
    title: "進捗可視化",
    description: "ゲーム感覚でタスクをこなし、XPとレベルで成長を実感できる仕組み",
    benefit: "迷わず次の行動に移れる"
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

const acquisitionPoints = [
  "登録後すぐに使える。初期設定は最小限",
  "就活タスクを1画面で整理できる",
  "ES・企業管理・面接ログを横断して管理"
];

const mvpContext = [
  {
    icon: ExclamationTriangleIcon,
    title: "就活の現状",
    description:
      "締切・面接・企業研究が同時に進み、何から手を付けるべきか見失いやすい状態になりがちです。"
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: "今やるべきこと",
    description:
      "応募先の優先順位付け、ESの改善、面接ログの振り返りを継続して、選考ごとの勝率を上げる必要があります。"
  },
  {
    icon: LifebuoyIcon,
    title: "ここでのサポート",
    description:
      "ES添削・企業/進捗管理・面接ログ整理を1つに集約し、次にやるべき行動を迷わないように支援します。"
  },
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
  const navLinkClass =
    "group inline-flex items-center gap-2 px-2 py-1 text-sm font-bold text-[#412c18] transition hover:text-[#9a4f00]";
  const navCaretClass =
    "text-[0.7rem] transition-transform duration-200 group-hover:translate-x-1";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#fff4dd_0%,#f2d8ad_45%,#d9ae74_100%)] text-[#412c18]">

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-10 sm:px-10 sm:py-14">
        {/* ヘッダー */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between gap-4"
        >
          <BrandLogo
            className="gap-4 font-semibold"
            iconClassName="h-16 w-16"
            textClassName="text-3xl text-[#4a2f16]"
          />
          <div className="flex items-center gap-3 text-sm">
            <Link
              href={ROUTES.LOGIN}
              className={navLinkClass}
            >
              <span className={navCaretClass}>▶</span>
              ログイン
            </Link>
          </div>
        </motion.header>

        {/* ヒーロー */}
        <section className="relative overflow-hidden rounded-2xl border border-[#b8844a] bg-[#f8e7c8] p-10 shadow-xl">
          <div className="pointer-events-none absolute -right-24 -top-20 h-56 w-56 rounded-full bg-linear-to-br from-[#f2dbb4]/80 to-[#e8c38d]/50 blur-3xl" />
          <div className="pointer-events-none absolute -left-28 bottom-[-110px] h-56 w-56 rounded-full bg-linear-to-br from-[#eed1a2]/70 to-[#f3ddb8]/30 blur-3xl" />
          <div className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#b8844a] bg-[#f2dbb4] px-3 py-1 text-[#744000]">
                  MVP BETA
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#b8844a] bg-[#f8e7c8] px-3 py-1 text-[#744000]">
                  AI活用
                  <SparklesIcon className="h-3 w-3 text-[#9a4f00]" />
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#b8844a] bg-[#f2dbb4] px-3 py-1 text-[#744000]">
                  無料で始められる
                  <CheckCircleIcon className="h-3 w-3 text-[#9a4f00]" />
                </span>
              </div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
              >
                情報過多な就活を
                <span className="text-[#9a4f00]">整理</span>して
                <span className="block text-[#6f4b25]">やるべき行動を明確にする</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="max-w-2xl text-lg leading-7 text-[#6f4b25]"
              >
                ES・面接・企業管理が分断されると、準備の優先順位が崩れやすくなります。<br />
                このMVPは「次に何をすべきか」を一画面で把握できるように設計しています。
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href={ROUTES.LOGIN}
                  className={navLinkClass}
                >
                  <span className={navCaretClass}>▶</span>
                  ログイン
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="#features"
                  className={navLinkClass}
                >
                  <span className={navCaretClass}>▶</span>
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
              <div className="space-y-5 rounded-2xl border border-[#b8844a] bg-[#f3ddb8] p-6 shadow-sm">
                <p className="text-sm font-semibold text-[#744000]">今すぐ始める理由</p>
                <ul className="space-y-3">
                  {acquisitionPoints.map((point, index) => (
                    <motion.li
                      key={point}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-[#4a2f16]"
                    >
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#9a4f00]" />
                      {point}
                    </motion.li>
                  ))}
                </ul>
                <Link href={ROUTES.LOGIN} className={navLinkClass}>
                  <span className={navCaretClass}>▶</span>
                  ログインして始める
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* MVPコンテキスト */}
        <section className="space-y-6">
          <motion.div {...fadeInUp} className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#744000]">
              MVP Overview
            </p>
            <h2 className="text-3xl font-bold text-[#412c18]">
              就活の現状と、ここで支援すること
            </h2>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-4 md:grid-cols-3"
          >
            {mvpContext.map((item) => (
              <motion.article
                key={item.title}
                variants={fadeInUp}
                className="rounded-2xl border border-[#b8844a] bg-[#f8e7c8] p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#b8844a] bg-[#f2dbb4] text-[#9a4f00]">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#412c18]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6f4b25]">{item.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* 機能セクション */}
        <section id="features" className="space-y-8">
          <motion.div
            {...fadeInUp}
            className="text-center space-y-3"
          >
            <h2 className="text-3xl font-bold text-[#412c18]">就活を変える3つの機能</h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6f4b25]">
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
                className="rounded-2xl border border-[#b8844a] bg-[#f8e7c8] p-8 shadow-sm transition-all duration-300"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-400 text-white shadow-md">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-[#412c18]">{feature.title}</h3>
                <p className="mb-4 leading-6 text-[#6f4b25]">{feature.description}</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f2dbb4] px-3 py-1 text-sm font-medium text-[#744000]">
                  <CheckCircleIcon className="h-4 w-4 text-[#9a4f00]" />
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
            <h2 className="text-3xl font-bold text-[#412c18]">簡単3ステップで始める</h2>
            <p className="text-lg text-[#6f4b25]">
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
                className="relative rounded-2xl border border-[#b8844a] bg-[#f8e7c8] p-6 text-center shadow-sm"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#b8844a] bg-[#f2dbb4] text-lg font-bold text-[#9a4f00]">
                  {step.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#412c18]">{step.title}</h3>
                <p className="text-sm text-[#6f4b25]">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden md:block">
                    <ArrowRightIcon className="h-6 w-6 text-[#9a4f00]" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA */}
        <motion.section
          {...fadeInUp}
          className="rounded-2xl border border-[#b8844a] bg-[#f8e7c8] p-10 text-center"
        >
          <div className="mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-bold text-[#412c18]">
              今すぐ就活を効率化しませんか？
            </h2>
            <p className="text-lg text-[#6f4b25]">
              無料で始められます。面倒な設定は不要で、登録後すぐに利用可能です。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={ROUTES.LOGIN}
                  className={navLinkClass}
                >
                  <span className={navCaretClass}>▶</span>
                  ログイン
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* セキュリティ */}
        <motion.section
          {...fadeInUp}
          className="rounded-2xl border border-[#b8844a] bg-[#f3ddb8] p-8"
        >
          <div className="flex items-center justify-center gap-3 text-[#744000]">
            <ShieldCheckIcon className="h-6 w-6" />
            <p className="font-semibold">安全・安心なデータ管理</p>
          </div>
          <div className="mt-4 grid gap-3 text-center text-sm text-[#6f4b25] md:grid-cols-3">
            <div>
              <strong className="text-[#412c18]">暗号化通信</strong>
              <br />全ての通信はSSLで保護
            </div>
            <div>
              <strong className="text-[#412c18]">データ保護</strong>
              <br />個人情報は厳格に管理
            </div>
            <div>
              <strong className="text-[#412c18]">セキュア認証</strong>
              <br />Google認証で安全ログイン
            </div>
          </div>
        </motion.section>

        <footer className="pb-2 text-center text-xs text-[#6f4b25]">
          © 2026 就活copilot. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
