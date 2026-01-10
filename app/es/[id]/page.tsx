import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, HomeIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { ROUTES } from "@/lib/constants/routes";
import { AppLayout } from "@/app/_components/layout";
import { deleteEs, updateEs } from "../actions";
import { EsDetailClient } from "../_components/es-detail-client";

type Question = { id: string; prompt: string; answer_md: string };

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function parseQuestions(questions: unknown): Question[] {
  if (!questions) return [];
  const parsed = typeof questions === "string" ? (() => { try { return JSON.parse(questions); } catch { return []; } })() : questions;
  if (Array.isArray(parsed)) {
    return parsed.map((q) => ({
      id: typeof q?.id === "string" ? q.id : makeId(),
      prompt: typeof q?.prompt === "string" ? q.prompt : "",
      answer_md: typeof q?.answer_md === "string" ? q.answer_md : "",
    }));
  }
  return [];
}

export default async function EsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) throw new Error("Supabase client unavailable");
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  if (!userId) return redirect(ROUTES.LOGIN);

  const { data, error } = await supabase
    .from("es_entries")
    .select("*, ai_summary")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return redirect(ROUTES.ES);
  }

  const questions = parseQuestions(data.questions);
  const combinedContent =
    questions.length > 0
      ? questions
          .map((q) => [q.prompt?.trim(), q.answer_md?.trim()].filter(Boolean).join("\n"))
          .filter(Boolean)
          .join("\n\n")
      : data.content_md ?? "";

  const handleUpdate = updateEs.bind(null, id);
  const handleDelete = deleteEs.bind(null, id);

  return (
    <AppLayout
      headerTitle="ES詳細"
      headerDescription="提出済みはプレビュー、編集ボタンで編集モードに切り替え"
      headerActions={
        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.HOME} className="mvp-button mvp-button-secondary">
            <HomeIcon className="h-4 w-4" />
            MVPホーム
          </Link>
          <Link href={ROUTES.DASHBOARD} className="mvp-button mvp-button-secondary">
            <ArrowUturnLeftIcon className="h-4 w-4" />
            ダッシュボードへ
          </Link>
          <Link href={ROUTES.ES} className="mvp-button mvp-button-secondary">
            <ArrowLeftIcon className="h-4 w-4" />
            一覧に戻る
          </Link>
        </div>
      }
      className="flex flex-col gap-8"
    >
      <EsDetailClient
        entry={{
          id: data.id,
          company_name: data.company_name,
          selection_status: data.selection_status,
          company_url: data.company_url,
          memo: data.memo,
          deadline: data.deadline,
          title: data.title,
          status: data.status,
          content_md: data.content_md,
          tags: data.tags,
          ai_summary: data.ai_summary,
        }}
        questions={questions}
        combinedContent={combinedContent}
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
      />
    </AppLayout>
  );
}
