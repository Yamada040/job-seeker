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
    <div className="relative min-h-screen text-slate-100">
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

        <div className="dq-card space-y-2 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Sign in</p>
          <h1 className="text-2xl font-semibold text-white">Googleでログイン</h1>
          <p className="text-sm text-white/70">Googleアカウントでサインインしてください。</p>
        </div>

        <LoginClient />

        <div className="dq-card p-5 text-sm text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-white/70">ご利用前に</p>
              <p className="text-sm text-white/70">サインイン後は、アカウントに紐づくデータが自動で読み込まれます。</p>
            </div>
            <Link href={ROUTES.DASHBOARD} className="dq-button text-xs">
              ダッシュボードを見る
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
