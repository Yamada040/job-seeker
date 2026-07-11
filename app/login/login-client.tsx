"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";

export function LoginClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signInError) throw signInError;
    } catch (err) {
      setError((err as Error)?.message ?? "Googleログインに失敗しました");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="dq-button w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "リダイレクト中..." : "Googleでログイン"}
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
