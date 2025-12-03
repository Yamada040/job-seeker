import Link from "next/link";

const highlights = [
  {
    title: "AI添削コパイロット",
    body: "Gemini/GPTどちらにも対応できる薄いラッパーでESを生成・添削。ボタンひとつでフィードバックを受け取れます。",
  },
  {
    title: "Notion風 企業管理",
    body: "ステータス・メモ・お気に入り・フィルタ付きの企業カード。就活向けにチューニングした軽量Notion風UI。",
  },
  {
    title: "ゲーム感のある継続体験",
    body: "XPとレベル表示、週次目標、モダンなUIで、重い就活を少しでも楽しく前向きに進めます。",
  },
];

const mvpModules = [
  {
    name: "ES",
    items: ["作成/編集/削除 (Markdown)", "タグ・ステータス付き一覧", "AI添削UI（ラッパー経由で呼び出し）"],
  },
  {
    name: "AI",
    items: ["lib/ai の薄いラッパー", "API route /api/ai で呼び出し", "ES・企業画面からの実行UI"],
  },
  {
    name: "企業",
    items: ["Notion風カード（URL/ステータス/メモ/お気に入り）", "フィルタ・ソート", "AI要約欄"],
  },
  {
    name: "XP / レベル",
    items: ["XPログテーブル", "レベルチップ + 進捗バー", "MVPでは表示のみ"],
  },
];

const roadmap = [
  { title: "Week 1", detail: "Supabase Auth/DB, RLS, UI土台" },
  { title: "Week 2", detail: "ES・企業CRUDとフィルタ、プロフィール" },
  { title: "Week 3", detail: "AI添削/企業分析の実行フロー（Gemini先行・GPT準備）" },
  { title: "Week 4", detail: "仕上げ・モバイル対応・Vercelデプロイ" },
];

const tech = [
  "Next.js (App Router, TypeScript, Server Actions)",
  "TailwindCSS（グラデ多めのモダンUI）",
  "Supabase (Auth/DB/Storage, RLS)",
  "AIラッパー: まずGemini、環境変数でGPTに切替可能",
  "Hosting: Vercel",
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,196,38,0.14),transparent_60%)] blur-2xl" />
        <div className="absolute right-10 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(94,234,212,0.1),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_40%,rgba(255,255,255,0.06)_100%)]" />
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-14 sm:px-10 sm:py-20">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-lg">
          <div className="absolute right-[-120px] -top-20 h-64 w-64 rotate-12 rounded-3xl bg-linear-to-br from-amber-300/50 via-orange-500/40 to-rose-500/40 blur-3xl" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                MVP プラン
                <span className="h-1 w-1 rounded-full bg-amber-300" aria-hidden />
                すぐ着工可能
              </div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                退屈な就活を「ゲーム感」で前向きにする
                <span className="block text-amber-200">AIコパイロットで短期攻略</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-100/80">
                AI添削ES、Notion風企業カード、XPで進捗を見える化。まずはGemini、後からGPTにスイッチ可能な構成です。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#next-actions"
                  className="rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:translate-y-0.5 hover:shadow-amber-500/50"
                >
                  次のアクション
                </Link>
                <Link
                  href="#mvp-modules"
                  className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  MVPモジュール
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  ダッシュボードを開く
                </Link>
              </div>
            </div>

            <div className="grid w-full max-w-md grid-cols-2 gap-4 text-sm text-slate-50">
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <p className="text-xs text-amber-200">現在のレベル</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-amber-300 to-orange-500 text-lg font-bold text-slate-950 shadow-lg shadow-amber-500/40">
                    LV1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-200">
                      <span>XP 320 / 1000</span>
                      <span>次: LV2</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className="h-full w-[32%] rounded-full bg-linear-to-r from-amber-400 to-rose-400" aria-hidden />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200/30 bg-emerald-300/10 p-4 shadow-inner">
                <p className="text-xs text-emerald-100">AI</p>
                <p className="mt-2 text-lg font-semibold">Gemini → GPT切替OK</p>
                <p className="text-xs text-emerald-50/80">環境変数だけで切替、コード修正不要。</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <p className="text-xs text-slate-200">DB</p>
                <p className="mt-2 text-lg font-semibold">Supabase + RLS</p>
                <p className="text-xs text-slate-200/80">Auth / Storage / Row Level Security</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-100/80">{item.body}</p>
            </article>
          ))}
        </section>

        <section id="mvp-modules" className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-amber-200">MVPモジュール</p>
            <h2 className="text-2xl font-semibold text-white">4週間で出荷できる最小セット</h2>
            <p className="text-sm text-slate-100/75">
              ES・企業管理・AI連携・XP表示に絞り、その他はMVP後に拡張します。
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {mvpModules.map((module) => (
              <article key={module.name} className="rounded-2xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-white/0 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{module.name}</h3>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-amber-100">MVP</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-100/85">
                  {module.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-linear-to-r from-amber-400 to-rose-400" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-linear-to-br from-slate-900 via-slate-900/80 to-slate-950 p-8 shadow-2xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">タイムライン</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">4週間のビルド計画</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-100/80">
                Supabaseで素早く構築し、AIキーを入れるまではスタブで運用。RLSは有効、UIはモバイル対応をキープします。
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-100">
              <span className="rounded-full bg-white/10 px-3 py-1">RLS</span>
              <span className="rounded-full bg-white/10 px-3 py-1">レベルUX</span>
              <span className="rounded-full bg-white/10 px-3 py-1">AI対応</span>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((item) => (
              <article key={item.title} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="absolute right-0 top-0 h-full w-1 bg-linear-to-b from-amber-300/60 via-rose-400/40 to-transparent" />
                <p className="text-sm font-semibold text-amber-200">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-100/85">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-amber-200">Tech choices</p>
            <h2 className="text-2xl font-semibold text-white">AIプロバイダーを差し替えやすい設計</h2>
            <p className="text-sm text-slate-100/80">
              まずGemini、後からGPTへ。UIとServer Actionは共通で、環境変数の切替だけで動作します。SupabaseがAuth/DB/RLSを担当。
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {tech.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-50 shadow-inner">
                <span className="h-2 w-2 rounded-full bg-linear-to-r from-amber-400 to-rose-400" aria-hidden />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="next-actions" className="rounded-3xl border border-amber-200/20 bg-linear-to-br from-amber-200/20 via-amber-100/15 to-white/5 p-8 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
            <p className="text-sm font-semibold text-amber-800">Next actions</p>
            <h2 className="text-2xl font-semibold text-slate-950">キーを入れてすぐ出荷</h2>
            <p className="text-sm text-slate-800/90">
              SupabaseとAIのキーを入れれば本稼働。キーが無い間はスタブで安全に動作し、追加後は同じUIで実APIを叩けます。
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow">
            <p className="font-semibold">設定が必要な環境変数</p>
            <ul className="space-y-1">
                <li>NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>SUPABASE_SERVICE_ROLE_KEY（サーバー専用）</li>
                <li>AI_PROVIDER_API_KEY（Gemini先行 / GPT後付け）</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
