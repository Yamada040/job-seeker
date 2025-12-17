 "use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRightIcon, SparklesIcon, ShieldCheckIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

import { useAppTheme } from "@/app/theme-provider";

const heroBadges = [
  { label: "MVPプラン", detail: "すぐ着手可能" },
  { label: "AIコパイロット", detail: "Gemini / GPT 切替OK" },
  { label: "Supabase + RLS", detail: "Auth・DB・Storage" },
];

const focusItems = [
  "ES下書きをドラフトしてAIに添削を依頼",
  "企業カードのステータス・志望度を最新化",
  "今週のタスクとXP進捗をチェック",
  "気になる企業をお気に入りに追加",
];

const modules = [
  {
    title: "AI添削コパイロット",
    body: "Gemini/GPTどちらでも動く薄いラッパー。ESを質問カード形式で送り、明瞭性・構成・改善案を受け取れます。",
  },
  {
    title: "Notion風 企業管理",
    body: "ステータス・志望度・メモをカードで整理。フィルタとお気に入りで、進捗が一目で分かります。",
  },
  {
    title: "ゲーム感のある進捗体験",
    body: "XPとレベル表示で「あと何をやるか」を明確に。1週間単位で達成感を積み上げます。",
  },
  {
    title: "ES/企業要約を保存",
    body: "AI生成した要約をカードに保管。再利用しやすく、面接前の振り返りも素早く。",
  },
];

const stats = [
  { title: "ESドラフト / 提出", value: "2 / 5" },
  { title: "企業分析", value: "4件" },
  { title: "選考ステータス", value: "面接 1 / 通過 1" },
  { title: "お気に入り", value: "5社" },
];

export default function Home() {
  const { setTheme } = useAppTheme();
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100 dark:bg-black">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_20%,rgba(255,196,38,0.12),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.1),transparent_45%),linear-gradient(135deg,#ffedd5_0%,#e0f2fe_45%,#e9d5ff_100%)] dark:bg-none" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[url('/bg-abstract.svg')] bg-cover bg-center opacity-80 dark:opacity-10" />

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10 sm:py-14">
        {/* ヘッダー */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-300 to-orange-500 text-sm font-bold text-slate-900 shadow-md shadow-amber-300/40">
              就
            </span>
            <span>就活Copilot</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-full border border-white/70 bg-white/80 px-4 py-2 font-semibold text-slate-800 shadow-sm transition hover:bg-white"
            >
              ログイン
            </Link>
            <Link
              href="/login?mode=signup"
              className="rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-2 font-semibold text-slate-900 shadow-lg shadow-amber-300/40 transition hover:translate-y-0.5"
            >
              新規登録
            </Link>
          </div>
        </header>

        {/* ヒーロー */}
        <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-8 shadow-2xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="absolute -right-32 -top-24 h-64 w-64 rotate-6 rounded-3xl bg-linear-to-br from-amber-300/50 via-orange-500/40 to-rose-500/40 blur-3xl" />
          <div className="absolute -left-28 bottom-[-90px] h-64 w-64 rounded-3xl bg-linear-to-br from-cyan-300/40 via-emerald-300/30 to-white/0 blur-3xl" />

          <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                {heroBadges.map((badge) => (
                  <span
                    key={badge.label}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1"
                  >
                    {badge.label}
                    <span className="text-[10px] font-normal text-amber-700">{badge.detail}</span>
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                退屈な就活を「ゲーム感」で前向きにする
                <span className="block text-amber-400">AIコパイロットで短期攻略</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-700">
                ES・企業研究・面接振り返りを一箇所に集約。AI添削とタスク管理で「次にやること」を迷わず進められます。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-300/40 transition hover:translate-y-0.5"
                >
                  ダッシュボードを開く
                </Link>
                <Link
                  href="#modules"
                  className="rounded-full border border-slate-300/80 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
                >
                  機能を見る
                </Link>
              </div>
            </div>

            <div className="grid w-full max-w-md grid-cols-2 gap-4 text-sm text-slate-900">
              <div className="col-span-2 rounded-2xl border border-amber-100 bg-linear-to-br from-amber-50 via-white to-rose-50 p-5 shadow-inner shadow-amber-200/40">
                <p className="text-xs text-amber-600">現在のレベル</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-amber-300 to-orange-500 text-lg font-bold text-slate-950 shadow-lg shadow-amber-500/40">
                    LV1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-700">
                      <span>XP 320 / 1000</span>
                      <span>次: LV2</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-amber-100/70">
                      <div className="h-full w-[32%] rounded-full bg-linear-to-r from-amber-400 to-rose-400" aria-hidden />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-inner shadow-emerald-200/50">
                <p className="text-xs text-emerald-700">AI</p>
                <p className="mt-2 text-lg font-semibold">Gemini / GPT 切替OK</p>
                <p className="text-xs text-emerald-700/80">環境変数だけで差し替え、コード修正不要。</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
                <p className="text-xs text-slate-600">DB</p>
                <p className="mt-2 text-lg font-semibold">Supabase + RLS</p>
                <p className="text-xs text-slate-600/80">Auth / Storage / Row Level Security</p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI / タスク */}
        <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Focus</h2>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700 shadow">{focusItems.length} 件</span>
            </div>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {focusItems.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 shadow-soft">
                  <SparklesIcon className="mt-0.5 h-4 w-4 text-amber-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Priorities & Metrics</h2>
              <ClipboardDocumentListIcon className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.title} className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm shadow-inner">
                  <p className="text-xs text-slate-500">{stat.title}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* モジュール紹介 */}
        <section id="modules" className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-amber-700">MVP機能</p>
            <h2 className="text-2xl font-semibold text-slate-900">就活を進めるためのコア体験</h2>
            <p className="text-sm text-slate-700">ES・企業研究・タスク/XP・AI活用に絞った、シンプルで続けやすい構成です。</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {modules.map((module) => (
              <article
                key={module.title}
                className="rounded-2xl border border-slate-200/80 bg-linear-to-br from-white via-slate-50 to-white p-5 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">MVP</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{module.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* セキュリティ / 導線 */}
        <section className="grid gap-4 lg:grid-cols-[1fr,0.8fr]">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-amber-700">
              <ShieldCheckIcon className="h-5 w-5" />
              <p className="text-sm font-semibold">安全な運用を想定</p>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>RLS有効のSupabaseでユーザーデータを保護</li>
              <li>メールリンク認証（Magic Link）で簡単ログイン</li>
              <li>AIキーを未設定でもスタブで安全に動作</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/dashboard" className="mvp-button mvp-button-primary">
                ダッシュボードへ
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link href="/es" className="mvp-button mvp-button-secondary">
                ESを確認
              </Link>
              <Link href="/companies" className="mvp-button mvp-button-secondary">
                企業カードを見る
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-amber-200/60 bg-linear-to-br from-amber-100/80 via-amber-50/90 to-white p-8 shadow-xl">
            <p className="text-sm font-semibold text-amber-800">すぐ始めるためのチェック</p>
            <ul className="mt-3 space-y-2 text-sm text-amber-900/80">
              <li>Supabase APIキー（URL, ANON KEY, SERVICE ROLE KEY）</li>
              <li>AI_PROVIDER_API_KEY（Gemini/GPTどちらでも）</li>
              <li>Redirect URLs: /auth/callback /dashboard を設定</li>
            </ul>
            <p className="mt-4 text-xs text-amber-700">キー未設定のときはダミーで動作し、後から同じUIで実APIを叩けます。</p>
          </div>
        </section>
      </main>
    </div>
  );
}
