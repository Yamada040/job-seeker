import Link from "next/link";

const featureCards = [
  {
    title: "AI添削でESを底上げ",
    body: "質問カードに分けて入力し、必要なときだけワンクリック添削。冗長な長文を避け、改善点と書き換え案を受け取れます。",
  },
  {
    title: "Notion風の企業管理",
    body: "志望度・ステータス・メモ・お気に入りをカードで整理。フィルタとソートで迷子にならず、最新の企業研究をキープ。",
  },
  {
    title: "タスクとXPで進捗が見える",
    body: "週次タスクとXP/レベル表示で「次にやること」が明確に。ゲーム感を取り入れてモチベーションを保ちます。",
  },
  {
    title: "面接・提出の振り返り",
    body: "面接のフィードバックや提出記録をまとめて管理。差分を蓄積し、内定率を上げる改善サイクルを回します。",
  },
];

const mvpModules = [
  {
    name: "ES管理",
    items: ["質問カード形式で分割入力", "タグ/ステータスで進捗管理", "AI添削をワンクリックで依頼"],
  },
  {
    name: "企業管理",
    items: ["ステータス・志望度・メモ・お気に入り", "フィルタ/ソートで見つけやすい", "AI要約をカードに保存"],
  },
  {
    name: "タスク/進捗",
    items: ["週次タスクの提案", "XP/レベルでゲーミフィケーション", "締切/面接予定を可視化"],
  },
  {
    name: "AI活用",
    items: ["Gemini/GPTを切替可能", "ES添削・企業分析をオンデマンドで実行", "長文は質問単位で分割レビュー"],
  },
];

const roadmap = [
  { title: "Step 1", detail: "ESと企業管理をまとめてスタート。質問カードでESを分割入力。" },
  { title: "Step 2", detail: "AI添削・企業分析をオンデマンドで利用。結果をカードに保存して比較。" },
  { title: "Step 3", detail: "タスクとXP/レベルで週次の進捗を確認。締切や面接予定を見逃さない。" },
  { title: "Step 4", detail: "面接メモや提出履歴を振り返り、改善サイクルを回す。" },
];

const tech = [
  "Next.js (App Router, TypeScript, Server Actions)",
  "TailwindCSS（ライトトーンのモダンUI）",
  "Supabase (Auth/DB/Storage, RLS)",
  "AIラッパー: Gemini ⇔ GPT 切替可",
  "Hosting: Vercel",
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-10 h-96 w-96 rotate-6 rounded-3xl bg-gradient-to-br from-amber-200/60 via-orange-200/40 to-rose-200/20 blur-3xl" />
        <div className="absolute right-[-140px] -top-24 h-[460px] w-[460px] rounded-full bg-gradient-to-br from-cyan-200/50 via-emerald-200/30 to-white/0 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,196,38,0.07),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.08),transparent_40%),linear-gradient(120deg,rgba(15,23,42,0.04)_0%,rgba(255,255,255,0.05)_50%,rgba(15,23,42,0.04)_100%)]" />
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-8 sm:px-10 sm:py-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-center text-sm font-bold leading-8 text-slate-900 shadow-md shadow-amber-300/40">
              MVP
            </span>
            就活コパイロット
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 font-semibold text-slate-800 shadow-sm transition hover:bg-white">
              ログイン
            </Link>
            <Link
              href="/login?mode=signup"
              className="rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-2 font-semibold text-slate-900 shadow-lg shadow-amber-300/40 transition hover:translate-y-0.5"
            >
              新規登録
            </Link>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-xl backdrop-blur">
          <div className="absolute right-[-120px] -top-20 h-64 w-64 rotate-12 rounded-3xl bg-gradient-to-br from-amber-300/50 via-orange-500/40 to-rose-500/40 blur-3xl" />
          <div className="absolute left-[-100px] bottom-[-80px] h-56 w-56 rounded-3xl bg-gradient-to-br from-cyan-300/40 via-emerald-300/30 to-white/0 blur-3xl" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                MVPプラン
                <span className="h-1 w-1 rounded-full bg-amber-500" aria-hidden />
                すぐ着工可能
              </div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                退屈な就活を「ゲーム感」で前向きにする
                <span className="block text-amber-400">AIコパイロットで短期攻略</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-700">
                ES添削、企業研究、面接振り返りを1か所に集約。AIとタスク管理で、「次に何をすべきか」をいつでも確認できます。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#next-actions"
                  className="rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-300/40 transition hover:translate-y-0.5"
                >
                  次のアクション
                </Link>
                <Link href="#mvp-modules" className="rounded-full border border-slate-300/80 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white">
                  MVPモジュール
                </Link>
                <Link href="/dashboard" className="rounded-full border border-slate-300/80 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white">
                  ダッシュボードを開く
                </Link>
              </div>
            </div>

            <div className="grid w-full max-w-md grid-cols-2 gap-4 text-sm text-slate-900">
              <div className="col-span-2 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4 shadow-inner shadow-amber-200/40">
                <p className="text-xs text-amber-600">現在のレベル</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-lg font-bold text-slate-950 shadow-lg shadow-amber-500/40">
                    LV1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-700">
                      <span>XP 320 / 1000</span>
                      <span>次: LV2</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-amber-100/70">
                      <div className="h-full w-[32%] rounded-full bg-gradient-to-r from-amber-400 to-rose-400" aria-hidden />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-inner shadow-emerald-200/50">
                <p className="text-xs text-emerald-700">AI</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Gemini → GPT切替OK</p>
                <p className="text-xs text-emerald-700/80">環境変数だけで切替、コード修正不要。</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
                <p className="text-xs text-slate-600">DB</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Supabase + RLS</p>
                <p className="text-xs text-slate-600/80">Auth / Storage / Row Level Security</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-md">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{item.body}</p>
            </article>
          ))}
        </section>

        <section id="mvp-modules" className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-md">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-amber-700">MVPモジュール</p>
            <h2 className="text-2xl font-semibold text-slate-900">就活を進めるための最小セット</h2>
            <p className="text-sm text-slate-700">ES管理、企業研究、タスク/XP、AI活用に絞り、面接・提出の振り返りをしやすくします。</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {mvpModules.map((module) => (
              <article key={module.name} className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{module.name}</h3>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">MVP</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {module.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-400" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="roadmap" className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 shadow-md">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">タイムライン</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">使い方の流れ</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-700">ES/企業の整理とAI活用を小さく始め、タスクと振り返りで改善を積み重ねていきます。</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-700">
              <span className="rounded-full bg-white px-3 py-1">整理</span>
              <span className="rounded-full bg-white px-3 py-1">AI活用</span>
              <span className="rounded-full bg-white px-3 py-1">振り返り</span>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((item) => (
              <article key={item.title} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-amber-300/60 via-rose-400/40 to-transparent" />
                <p className="text-sm font-semibold text-amber-700">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="tech" className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-md">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-amber-700">Tech choices</p>
            <h2 className="text-2xl font-semibold text-slate-900">AIプロバイダーを差し替えやすい設計</h2>
            <p className="text-sm text-slate-700">Geminiから始め、後からGPTへ切替可能。UIとサーバーアクションは共通で、環境変数だけで切替できます。SupabaseがAuth/DB/RLSを担当。</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {tech.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-inner">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-400" aria-hidden />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="next-actions"
          className="rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-100/70 via-amber-50/80 to-white p-8 shadow-md"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-800">次のアクション</p>
              <h2 className="text-2xl font-semibold text-slate-900">キーを入れてすぐ出荷</h2>
              <p className="text-sm text-slate-800/90">SupabaseとAIのキーを入れれば本稼働。キーが無い間はスタブで安全に動作し、追加後は同じUIで実APIを叩けます。</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow">
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
