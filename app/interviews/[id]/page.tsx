import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUturnLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

import { AppLayout } from "@/app/_components/layout";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import InterviewForm from "../_components/interview-form";
import { InterviewQuestionsPayload } from "../types";

function parseQuestions(raw: unknown): InterviewQuestionsPayload | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw as InterviewQuestionsPayload;
  if (typeof raw === "object") return raw as InterviewQuestionsPayload;
  return null;
}

export default async function InterviewDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const id = typeof resolvedParams === "object" ? (resolvedParams as { id?: string }).id : undefined;
  if (!id || id === "undefined") return notFound();
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const { data: log } = await supabase
    .from("interview_logs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!log) return notFound();

  const { data: companies } = await supabase
    .from("companies")
    .select("name")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  const companyOptions =
    companies?.filter((c) => c.name).map((c) => ({ value: c.name as string, label: c.name as string })) ?? [];

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href="/interviews" className="mvp-button mvp-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        面接ログ一覧へ
      </Link>
      <Link href="/dashboard" className="mvp-button mvp-button-secondary">
        <HomeIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle="面接ログを編集"
      headerDescription="面接後のログを更新し、次回改善に役立ててください。"
      headerActions={headerActions}
      className="space-y-6"
    >
      <InterviewForm
        mode="update"
        interviewId={log.id}
        initialCompanyName={log.company_name ?? undefined}
        companyOptions={companyOptions}
        initialStage={log.stage}
        initialDate={(log.interview_date as string | null) ?? undefined}
        initialSelfReview={log.self_review}
        initialQuestions={parseQuestions(log.questions)}
        initialFormat={log.interview_title}
        initialAiSummary={log.ai_summary}
        initialIsTemplate={(log.stage ?? "").toLowerCase() === "template"}
      />
    </AppLayout>
  );
}
