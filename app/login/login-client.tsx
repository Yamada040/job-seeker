"use client";

import { useActionState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";

export function LoginClient() {
  const [state, formAction, isPending] = useActionState<{ error: string } | null, FormData>(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signInError) throw signInError;
      // OAuthページへ遷移するまで「リダイレクト中...」表示を維持する
      await new Promise<never>(() => {});
      return null;
    } catch (err) {
      return { error: (err as Error)?.message ?? "Googleログインに失敗しました" };
    }
  }, null);

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="dq-button w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "リダイレクト中..." : "Googleでログイン"}
        </button>
      </form>
      {state?.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
    </div>
  );
}
