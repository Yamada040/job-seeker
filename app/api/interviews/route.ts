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

export async function POST(request: Request) {
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

  // 任意入力に緩和。空でも保存可能にする。
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
    user_id: userData.user.id,
    company_name: companyName,
    interview_title: format || body?.interviewTitle || (template ? "準備用テンプレート" : null),
    interview_date: template ? null : interviewDate,
    stage: template ? "template" : stage,
    questions: { items: normalized.items, reflection: normalized.reflection },
    self_review: reflectionText || null,
  };

  const { data, error } = await supabase.from("interview_logs").insert(payload).select("id").single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
