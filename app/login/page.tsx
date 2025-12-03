"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // 既にログイン済みならダッシュボードへ
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
        setMessage(mode === "signup" ? "登録用のメールを送信しました。受信トレイを確認してください。" : "ログイン用のメールを送信しました。受信トレイを確認してください。");
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
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,196,38,0.14),transparent_60%)] blur-2xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_40%,rgba(255,255,255,0.04)_100%)]" />
      </div>

      <main className="mx-auto flex max-w-lg flex-col gap-8 px-6 py-16">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">Sign in</p>
          <h1 className="text-3xl font-semibold">メールまたはGoogleでログイン</h1>
          <p className="text-sm text-slate-100/80">Magic Link か Google アカウントでログインできます。登録済みならそのままログイン、新規ならメールで本登録を完了してください。</p>
        </div>

        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-full border px-3 py-2 ${mode === "signin" ? "border-amber-300 bg-amber-300/20 text-amber-50" : "border-white/20 text-white"}`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full border px-3 py-2 ${mode === "signup" ? "border-emerald-300 bg-emerald-300/20 text-emerald-50" : "border-white/20 text-white"}`}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
          <label className="block text-sm text-slate-100/90">
            メールアドレス
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-amber-300"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:translate-y-0.5 hover:shadow-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "送信中..." : "Magic Link を送る"}
          </button>
          {message ? <p className="text-xs text-emerald-200">{message}</p> : null}
          {error ? <p className="text-xs text-rose-300">{error}</p> : null}
        </form>

        <div className="flex items-center gap-3 text-xs text-slate-300/70">
          <span className="h-px flex-1 bg-white/10" />
          <span>または</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Googleで続ける
        </button>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-100 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-200">ログイン後のヒント</p>
              <p className="text-sm">メールを開いてMagic Linkを踏むと、そのままダッシュボードに遷移します。ログイン済みならこのページからダッシュボードへ移動できます。</p>
            </div>
            <Link href="/dashboard" className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
              ダッシュボードへ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
