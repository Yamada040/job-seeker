"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/_components/theme-toggle";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.location.replace("/dashboard");
      }
    };
    checkSession();
  }, []);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectBase = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { data, error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${redirectBase}/auth/callback`,
          shouldCreateUser: mode === "signup",
        },
      });
      if (signInError) throw signInError;
      if (data) {
        setMessage(mode === "signup" ? "登録用のメールを送信しました。受信ボックスをご確認ください。" : "ログイン用のメールを送信しました。受信ボックスをご確認ください。");
      }
    } catch (err) {
      setError((err as Error)?.message ?? "メール送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectBase = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectBase}/auth/callback`,
        },
      });
      if (signInError) throw signInError;
    } catch (err) {
      setError((err as Error)?.message ?? "Googleログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_25%_20%,rgba(255,196,38,0.12),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.1),transparent_45%),linear-gradient(135deg,#ffedd5_0%,#e0f2fe_45%,#e9d5ff_100%)] text-slate-900 dark:bg-black dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[url('/bg-abstract.svg')] bg-cover bg-center opacity-80 dark:opacity-10" />

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-12 sm:py-16">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-300 to-orange-500 text-sm font-bold text-slate-900 shadow-md shadow-amber-300/40">
              就
            </span>
            就活Copilot
          </div>
          <Link href="/" className="text-sm text-amber-700 hover:underline">
            ホームへ戻る
          </Link>
        </div>

        <div className="space-y-2 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Sign in</p>
          <h1 className="text-2xl font-semibold">メールまたはGoogleでログイン</h1>
          <p className="text-sm text-slate-700">Magic Link方式で、メールに届くリンクを押すだけでログインできます。登録済みか未登録かはメールで自動判定します。</p>
        </div>

        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-full border px-3 py-2 ${mode === "signin" ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-700"}`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full border px-3 py-2 ${mode === "signup" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700"}`}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <label className="block text-sm text-slate-700">
            メールアドレス
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-500 focus:border-amber-300"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:translate-y-0.5 hover:shadow-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "送信中..." : "Magic Link を送る"}
          </button>
          {message ? <p className="text-xs text-emerald-600">{message}</p> : null}
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
        </form>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="h-px flex-1 bg-slate-200" />
          <span>または</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          Googleでログイン
        </button>

        <div className="rounded-2xl border border-white/70 bg-white/80 p-5 text-sm text-slate-900 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-amber-700">すぐに試したい場合</p>
              <p className="text-sm text-slate-700">メール送信が面倒なら、ダッシュボードでデモデータを確認してからログインすることもできます。</p>
            </div>
            <Link href="/dashboard" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white">
              デモを見る
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
