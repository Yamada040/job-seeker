import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon, ArrowUturnLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

import { AppLayout } from "@/app/_components/layout";
import InterviewForm from "../_components/interview-form";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";

export default async function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const [{ data, error }, { data: companies }] = await Promise.all([
    supabase.from("interview_logs").select("*").eq("id", id).eq("user_id", userData.user.id).maybeSingle(),
    supabase.from("companies").select("name").eq("user_id", userData.user.id).order("created_at", { ascending: false }),
  ]);

  if (error || !data) return notFound();

  const companyOptions =
    companies?.filter((c) => c.name).map((c) => ({ value: c.name as string, label: c.name as string })) ?? [];

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href="/interviews" className="mvp-button mvp-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
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
      headerTitle="面接ログ編集"
      headerDescription="記録した質問・回答・自己評価を編集し、AI改善サマリーを保存"
      headerActions={headerActions}
      className="space-y-6"
    >
      <InterviewForm
        mode="update"
        interviewId={id}
        companyOptions={companyOptions}
        initialCompanyName={data.company_name ?? ""}
        initialTitle={data.interview_title}
        initialStage={data.stage}
        initialDate={data.interview_date}
        initialSelfReview={data.self_review}
        initialQuestions={(data.questions as { question: string; answer: string }[] | null) ?? []}
        initialAiSummary={data.ai_summary}
      />
    </AppLayout>
  );
}
