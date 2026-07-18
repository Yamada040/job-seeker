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
  LifebuoyIcon,
  RocketLaunchIcon,
  TrophyIcon,
  BoltIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

import { ROUTES } from "@/lib/constants/routes";
import { BrandLogo } from "./_components/layout/BrandLogo";

const features = [
  {
    icon: PencilSquareIcon,
    title: "AI ES添削",
    description: "論点、具体性、企業理解の抜けを洗い出し、提出前の完成度を高めます。",
    benefit: "伝わるESに磨き上げる",
    accent: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  {
    icon: BuildingOffice2Icon,
    title: "企業管理",
    description: "志望度、選考状況、マイページ、メモをまとめて、次の行動に接続します。",
    benefit: "抜け漏れを防いで前進できる",
    accent: "border-violet-200 bg-violet-50 text-violet-700",
  },
  {
    icon: ChartBarIcon,
    title: "進捗可視化",
    description: "XP、レベル、締切、面接ログを見える化し、日々の準備を継続しやすくします。",
    benefit: "迷わず次の行動に移れる",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
];

const steps = [
  {
    step: "01",
    title: "軸を整理",
    description: "自己分析と適性チェックで、企業選びとESの土台を整えます。",
    icon: MagnifyingGlassIcon,
  },
  {
    step: "02",
    title: "応募を集約",
    description: "企業・ES・面接予定を登録し、選考ごとの状態を1画面で追います。",
    icon: DocumentTextIcon,
  },
  {
    step: "03",
    title: "AIで改善",
    description: "添削と振り返りを回して、次の提出・面接に改善を反映します。",
    icon: SparklesIcon,
  },
];

const acquisitionPoints = ["ログイン後すぐに使える", "就活タスクを1画面で整理", "ES・企業・面接ログを横断管理"];

const attractionBadges = [
  { icon: RocketLaunchIcon, label: "準備の迷いを削減" },
  { icon: TrophyIcon, label: "継続しやすい設計" },
  { icon: BoltIcon, label: "毎日の行動が明確" },
];

const dashboardStats = [
  { label: "今週の締切", value: "6", tone: "text-amber-300" },
  { label: "ES改善", value: "+18%", tone: "text-cyan-300" },
  { label: "面接ログ", value: "12", tone: "text-emerald-300" },
];

const timelineItems = [
  { time: "09:00", title: "第一志望 ES最終確認", status: "AI添削済み", color: "bg-cyan-400" },
  { time: "14:00", title: "面接ログを3分で整理", status: "振り返り待ち", color: "bg-emerald-400" },
  { time: "18:30", title: "企業研究メモを更新", status: "次アクション化", color: "bg-amber-300" },
];

const workflowPillars = [
  { title: "軸", value: "自己分析", note: "企業選びの基準を固定", tone: "bg-cyan-500" },
  { title: "応募", value: "企業管理", note: "締切と志望度を同時に把握", tone: "bg-violet-500" },
  { title: "改善", value: "AI添削", note: "提出前の弱点を明確化", tone: "bg-emerald-500" },
  { title: "振り返り", value: "面接ログ", note: "次回質問と改善点に変換", tone: "bg-amber-400" },
];

const flowCode = [
  "const tasks = collect(deadlines, drafts);",
  "const next = tasks.sortByImpact()[0];",
  "return copilot.prepare(next);",
];

const mvpContext = [
  {
    icon: ExclamationTriangleIcon,
    title: "就活の現状",
    description: "締切、面接、企業研究が同時に走り、優先順位を見失いやすくなります。",
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: "今やるべきこと",
    description: "応募先ごとの次アクションを明確にして、準備の抜け漏れを減らします。",
  },
  {
    icon: LifebuoyIcon,
    title: "ここでのサポート",
    description: "ES、企業、面接ログをまとめ、AIで改善点を見つけやすくします。",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const primaryLinkClass =
  "inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-slate-50 shadow-[0_14px_34px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2";

const secondaryLinkClass =
  "inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white/85 px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7fbff] text-slate-950">
      <main>
        <section className="relative min-h-[92vh] overflow-hidden bg-slate-950 px-6 pb-16 pt-6 text-slate-50 sm:px-10 lg:px-14">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,47,73,0.96),rgba(15,23,42,0.92)_46%,rgba(49,46,129,0.88))]" />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
          <motion.div
            aria-hidden="true"
            animate={{ x: ["0%", "-8%", "0%"], y: ["0%", "4%", "0%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[50%] top-[22%] hidden w-[66rem] max-w-none rotate-[-7deg] gap-4 opacity-45 blur-[0.2px] lg:grid lg:grid-cols-[1fr_0.85fr_0.7fr]"
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-cyan-300/20 bg-white/10 p-5 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-200">SELECTION PIPELINE</span>
                  <CalendarDaysIcon className="h-5 w-5 text-cyan-200" />
                </div>
                <div className="mt-5 space-y-3">
                  {timelineItems.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/55 p-3"
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-50">{item.title}</p>
                        <p className="text-xs text-slate-300">{item.status}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-300">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {dashboardStats.map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className={`text-2xl font-black ${stat.tone}`}>{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-16 rounded-lg border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-200">
                <UserGroupIcon className="h-5 w-5" />
                COMPANIES
              </div>
              <div className="mt-5 space-y-3">
                {["SaaS企業 A", "メーカー B", "コンサル C", "Fintech D"].map((company, index) => (
                  <div key={company} className="rounded-lg bg-slate-900/50 p-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-slate-50">{company}</span>
                      <span className="text-xs text-slate-300">{index % 2 === 0 ? "面接前" : "ES作成中"}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${48 + index * 12}%` }}
                        transition={{ duration: 1.2, delay: 0.4 + index * 0.1 }}
                        className="h-full rounded-full bg-cyan-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                  <SparklesIcon className="h-5 w-5" />
                  AI REVIEW
                </div>
                <p className="mt-4 text-3xl font-black text-emerald-200">86</p>
                <p className="mt-1 text-xs text-slate-200">志望動機の具体性が改善</p>
              </div>
              <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                  <ClockIcon className="h-5 w-5" />
                  NEXT ACTION
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-50">面接ログを要点化して、次回質問を3つ作成</p>
              </div>
            </div>
          </motion.div>

          <div className="relative z-10 mx-auto flex min-h-[84vh] max-w-7xl flex-col">
            <motion.header
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="flex items-center justify-between gap-4"
            >
              <BrandLogo className="rounded-lg bg-white/90 px-3 py-1.5 shadow-sm" logoClassName="h-12 sm:h-14" />
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-slate-50 backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                ログイン
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </motion.header>

            <div className="flex flex-1 items-center py-16 lg:py-20">
              <div className="max-w-[44rem] space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.1 }}
                  className="flex flex-wrap gap-2"
                >
                  <span className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                    MVP BETA
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300/12 px-3 py-1.5 text-xs font-bold text-emerald-100">
                    <CheckCircleIcon className="h-4 w-4" />
                    無料で始められる
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.72, delay: 0.22 }}
                  className="text-4xl font-black leading-[1.08] tracking-normal text-slate-50 sm:text-5xl lg:text-6xl"
                >
                  就活copilot
                  <span className="mt-3 block text-cyan-200">次の一手が見える</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.72, delay: 0.34 }}
                  className="max-w-2xl text-base leading-8 text-slate-200 sm:text-lg"
                >
                  ES、企業研究、締切、面接ログを1つに集約。AI添削と進捗可視化で、今日やるべき準備まで迷わず落とし込みます。
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.72, delay: 0.46 }}
                  className="flex flex-wrap gap-3"
                >
                  <Link
                    href={ROUTES.LOGIN}
                    className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-cyan-200 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_18px_42px_rgba(103,232,249,0.24)] transition hover:-translate-y-0.5 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  >
                    ログインして始める
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-slate-50 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  >
                    機能を見る
                  </Link>
                </motion.div>

                <motion.div
                  variants={staggerChildren}
                  initial="initial"
                  animate="animate"
                  className="grid gap-3 pt-4 sm:grid-cols-3"
                >
                  {attractionBadges.map((badge) => (
                    <motion.div
                      key={badge.label}
                      variants={fadeInUp}
                      className="flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 backdrop-blur"
                    >
                      <badge.icon className="h-4 w-4 text-cyan-200" />
                      {badge.label}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative bg-[#f7fbff] px-6 py-24 sm:px-10 lg:px-14">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-200 to-transparent" />
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            {dashboardStats.map((stat) => (
              <motion.div
                key={stat.label}
                {...fadeInUp}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.07)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan-300 via-violet-300 to-emerald-300 opacity-0 transition group-hover:opacity-100" />
                <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <p className="text-4xl font-black text-slate-950">{stat.value}</p>
                  <span className="h-10 w-20 rounded-lg bg-[linear-gradient(135deg,#ecfeff,#f5f3ff_48%,#ecfdf5)]" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mx-auto mt-24 grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <motion.section {...fadeInUp} className="space-y-6">
              <p className="text-xs font-black uppercase text-cyan-700">FIRST*RUN</p>
              <h2 className="max-w-2xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                散らばった準備を、今日の一手へ。
              </h2>
              <p className="max-w-xl text-base leading-7 text-slate-600">
                MVPでは、余計な初期設定よりも「今の就活状況を見える化する」ことを優先しています。登録後は、軸、応募、改善、振り返りの流れで使い始められます。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={ROUTES.LOGIN} className={primaryLinkClass}>
                  ログイン
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link href={ROUTES.SELF_ANALYSIS} className={secondaryLinkClass}>
                  自己分析を見る
                </Link>
              </div>
            </motion.section>

            <motion.div
              {...fadeInUp}
              viewport={{ once: true }}
              className="overflow-hidden rounded-lg border border-slate-950 bg-slate-950 shadow-[0_28px_80px_rgba(15,23,42,0.22)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <span className="text-xs font-black uppercase text-cyan-200">copilot.flow.ts</span>
                <span className="text-xs font-bold text-slate-500">01 / FLOW</span>
              </div>
              <div className="space-y-4 p-5 font-mono text-sm leading-7 text-slate-300">
                {flowCode.map((line, index) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.42, delay: index * 0.1 }}
                  >
                    <span className="mr-4 text-slate-600">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-cyan-200">{line}</span>
                  </motion.p>
                ))}
              </div>
              <div className="grid border-t border-white/10 sm:grid-cols-3">
                {["deadline", "draft", "interview"].map((item) => (
                  <div
                    key={item}
                    className="border-white/10 px-5 py-4 text-xs font-bold uppercase text-slate-400 sm:border-r"
                  >
                    {item}.ready
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mx-auto mt-12 grid max-w-7xl gap-4 md:grid-cols-4"
          >
            {workflowPillars.map((item, index) => (
              <motion.article
                key={item.title}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.07)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black text-slate-400">0{index + 1}</span>
                  <span className={`h-3 w-3 rounded-full ${item.tone}`} />
                </div>
                <p className="mt-5 text-xs font-black uppercase text-slate-500">{item.title}</p>
                <h3 className="mt-2 text-lg font-black text-slate-950">{item.value}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className="bg-slate-950 px-6 py-24 text-slate-50 sm:px-10 lg:px-14">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div {...fadeInUp} className="space-y-4">
              <p className="text-xs font-black uppercase text-violet-200">WHY*IT*WORKS</p>
              <h2 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                情報整理から、行動の決定までを1本につなぐ
              </h2>
              <p className="text-base leading-7 text-slate-300">
                就活で詰まりやすいのは、情報が足りない時よりも、情報が分散して優先順位が見えない時です。就活copilotは、散らばった準備を次アクションに変換するためのMVPです。
              </p>
            </motion.div>

            <motion.div
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid gap-3"
            >
              {mvpContext.map((item, index) => (
                <motion.article
                  key={item.title}
                  variants={fadeInUp}
                  className="grid gap-4 rounded-lg border border-cyan-100 bg-white/8 p-5 shadow-[0_20px_55px_rgba(0,0,0,0.18)] sm:grid-cols-[auto_1fr]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-cyan-200">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-slate-500">0{index + 1}</span>
                      <h3 className="text-lg font-black text-slate-50">{item.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="features" className="bg-white px-6 py-24 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeInUp} className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-3xl space-y-3">
                <p className="text-xs font-black uppercase text-cyan-700">CORE*FEATURES</p>
                <h2 className="text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                  就活を前に進める3つの機能
                </h2>
                <p className="text-base leading-7 text-slate-600">
                  AI添削、企業管理、進捗可視化を分断せず、準備の流れとして使えるようにしています。
                </p>
              </div>
              <Link href={ROUTES.LOGIN} className={secondaryLinkClass}>
                試してみる
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="mt-10 grid gap-5 lg:grid-cols-3"
            >
              {features.map((feature, index) => (
                <motion.article
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className="relative overflow-hidden rounded-lg border border-slate-200 bg-[#fbfdff] p-6 shadow-[0_20px_55px_rgba(15,23,42,0.07)]"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-cyan-100/70 blur-2xl" />
                  <div className="relative mb-8 flex items-center justify-between gap-4">
                    <span className="text-xs font-black text-slate-400">0{index + 1}</span>
                    <span className="text-xs font-black uppercase text-slate-400">module</span>
                  </div>
                  <div
                    className={`relative mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg border ${feature.accent}`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="relative text-xl font-black text-slate-950">{feature.title}</h3>
                  <p className="relative mt-3 min-h-20 text-sm leading-6 text-slate-600">{feature.description}</p>
                  <div className="relative mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                    {feature.benefit}
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="bg-[#f7fbff] px-6 py-24 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeInUp} className="max-w-3xl space-y-3">
              <p className="text-xs font-black uppercase text-emerald-700">START*FLOW</p>
              <h2 className="text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                簡単3ステップで始める
              </h2>
              <p className="text-base leading-7 text-slate-600">
                最初から完璧に入力する必要はありません。まず状況を置き、AIと振り返りで更新していく設計です。
              </p>
            </motion.div>

            <motion.div
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="mt-10 grid gap-5 md:grid-cols-3"
            >
              {steps.map((step) => (
                <motion.article
                  key={step.step}
                  variants={fadeInUp}
                  whileHover={{ y: -6 }}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.07)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-black text-slate-400">{step.step}</span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-cyan-200">
                      <step.icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-black text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="bg-slate-950 px-6 py-24 text-slate-50 sm:px-10 lg:px-14">
          <motion.div
            {...fadeInUp}
            className="mx-auto grid max-w-7xl gap-8 rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(14,116,144,0.32),rgba(15,23,42,0.94)_46%,rgba(88,28,135,0.22))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.32)] md:grid-cols-[1fr_0.8fr] md:items-center md:p-8"
          >
            <div className="space-y-4">
              <p className="text-xs font-black uppercase text-cyan-200">CONTACT*POINT</p>
              <h2 className="text-3xl font-black tracking-normal text-slate-50 sm:text-4xl">
                今日の就活タスクを、次の一手まで分解する
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-300">
                無料で始められます。登録後すぐに、自己分析、企業管理、ES添削の順で使い始められます。
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/10 p-6">
              <ul className="space-y-3">
                {acquisitionPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm font-semibold text-slate-100">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-300" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-cyan-200 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              >
                ログインして始める
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="bg-[#f7fbff] px-6 py-10 sm:px-10 lg:px-14">
          <motion.div
            {...fadeInUp}
            className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-6 py-5 text-center shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:flex-row md:text-left"
          >
            <div className="flex items-center gap-3 text-slate-800">
              <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-black">安全・安心なデータ管理</p>
                <p className="text-sm text-slate-600">SSL通信、Google認証、個人情報保護を前提に設計しています。</p>
              </div>
            </div>
            <footer className="text-xs text-slate-500">© 2026 就活copilot. All rights reserved.</footer>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
