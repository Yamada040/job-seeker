import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUturnLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

import { AppLayout } from "@/app/_components/layout";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import SelfAnalysisForm from "./_components/self-analysis-form";

export default async function SelfAnalysisPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const { data } = await supabase
    .from("self_analysis_results")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href="/dashboard" className="mvp-button mvp-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
      <Link href="/" className="mvp-button mvp-button-secondary">
        <HomeIcon className="h-4 w-4" />
        MVPホーム
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle="自己分析"
      headerDescription="強み・価値観・モチベーションをAIで整理"
      headerActions={headerActions}
      className="space-y-6"
    >
      <SelfAnalysisForm
        initialAnswers={(data?.answers as Record<string, unknown>) ?? null}
        initialSummary={data?.ai_summary ?? null}
        initialResultId={data?.id ?? null}
      />
    </AppLayout>
  );
}
