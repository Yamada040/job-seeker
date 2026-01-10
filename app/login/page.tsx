import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { ROUTES } from "@/lib/constants/routes";
import { LoginClient } from "./login-client";

export default async function LoginPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) {
    throw new Error("Supabase client unavailable");
  }
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    return redirect(ROUTES.DASHBOARD);
  }

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
          <Link href={ROUTES.HOME} className="text-sm text-amber-700 hover:underline">
            ホームへ戻る
          </Link>
        </div>

        <div className="space-y-2 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Sign in</p>
          <h1 className="text-2xl font-semibold">Googleでログイン</h1>
          <p className="text-sm text-slate-700">Googleアカウントでサインインしてください。</p>
        </div>

        <LoginClient />

        <div className="rounded-2xl border border-white/70 bg-white/80 p-5 text-sm text-slate-900 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-amber-700">ご利用前に</p>
              <p className="text-sm text-slate-700">サインイン後は、アカウントに紐づくデータが自動で読み込まれます。</p>
            </div>
            <Link href={ROUTES.DASHBOARD} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white">
              ダッシュボードを見る
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
