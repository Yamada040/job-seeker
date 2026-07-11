"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOut = () => {
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.refresh();
      router.push("/login");
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="dq-button-secondary text-xs disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "サインアウト中..." : "サインアウト"}
    </button>
  );
}
