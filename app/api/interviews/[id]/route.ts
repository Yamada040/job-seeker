import { NextResponse } from "next/server";

import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";
import { InterviewQA } from "@/app/interviews/types";

type QuestionsInput =
  | {
      items?: InterviewQA[];
      reflection?: { improvement?: string; unexpected?: string };
    }
  | InterviewQA[]
  | null
  | undefined;

function normalizeQuestions(input: QuestionsInput): {
  items: InterviewQA[];
  reflection: { improvement: string; unexpected: string };
} {
  const baseReflection = { improvement: "", unexpected: "" };
  if (!input) return { items: [], reflection: baseReflection };
  if (Array.isArray(input)) {
    const items = input
      .map((q) => ({
        question: q.question || "",
        answer: q.answer || "",
        rating: q.rating ?? "average",
      }))
      .filter((q) => q.question.trim() || q.answer.trim());
    return { items, reflection: baseReflection };
  }
  const items = (input.items ?? [])
    .map((q) => ({
      question: q.question || "",
      answer: q.answer || "",
      rating: q.rating ?? "average",
    }))
    .filter((q) => q.question.trim() || q.answer.trim());
  return {
    items,
    reflection: {
      improvement: input.reflection?.improvement ?? "",
      unexpected: input.reflection?.unexpected ?? "",
    },
  };
}

export async function PUT(
  request: Request,
  ctx: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await Promise.resolve(ctx.params);
  const id = (resolvedParams as { id?: string })?.id;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const supabase = await createSupabaseServerActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const companyName = body?.companyName as string | undefined;
  if (!companyName) {
    return NextResponse.json({ error: "companyName is required" }, { status: 400 });
  }
  const template = Boolean(body?.template);
  const stage = (body?.stage as string | undefined)?.trim() || null;
  const interviewDate = (body?.interviewDate as string | undefined) ?? null;
  const format = (body?.interviewFormat as string | undefined)?.trim() || null;

  const normalized = normalizeQuestions(body?.questions as QuestionsInput);
  if (!normalized.items.length) {
    return NextResponse.json({ error: "At least one question/answer is required" }, { status: 400 });
  }
  const reflectionText = [
    normalized.reflection.improvement ? `改善したい点: ${normalized.reflection.improvement}` : "",
    normalized.reflection.unexpected ? `想定外だったこと: ${normalized.reflection.unexpected}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const payload = {
    company_name: companyName,
    interview_title: format || body?.interviewTitle || (template ? "準備用テンプレート" : null),
    interview_date: template ? null : interviewDate,
    stage: template ? "template" : stage,
    questions: { items: normalized.items, reflection: normalized.reflection },
    self_review: reflectionText || null,
  };

  const { data, error } = await supabase
    .from("interview_logs")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ id: data.id });
}
