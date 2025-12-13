"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";

export async function createWebtestQuestion(formData: FormData) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const title = (formData.get("title") as string | null)?.trim();
  const body = (formData.get("body") as string | null)?.trim();
  const answer = (formData.get("answer") as string | null)?.trim();
  if (!title || !body || !answer) throw new Error("必須項目が不足しています");

  const choicesRaw = (formData.get("choices") as string | null) || "";
  const choices =
    choicesRaw
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean) || null;

  const payload = {
    user_id: userData.user.id,
    title,
    body,
    test_type: (formData.get("test_type") as string | null) || null,
    choices: choices?.length ? choices : null,
    answer,
    explanation: (formData.get("explanation") as string | null) || null,
    category: (formData.get("category") as string | null) || null,
    format: (formData.get("format") as string | null) || null,
    difficulty: (formData.get("difficulty") as string | null) || null,
    time_limit: formData.get("time_limit") ? Number(formData.get("time_limit")) : null,
  };

  const { error } = await supabase.from("webtest_questions").insert(payload);
  if (error) throw error;

  revalidatePath("/webtests");
  redirect("/webtests");
}

export async function submitWebtestAnswer(questionId: string, formData: FormData) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const userAnswer = (formData.get("answer") as string | null) ?? "";
  const timeSpent = formData.get("time_spent") ? Number(formData.get("time_spent")) : null;

  const { data: question } = await supabase
    .from("webtest_questions")
    .select("answer")
    .eq("id", questionId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!question) {
    redirect(`/webtests/${questionId}?status=notfound`);
  }

  const normalize = (s: string) => s.trim().toLowerCase();
  const isCorrect = normalize(userAnswer) === normalize(question.answer);

  await supabase.from("webtest_attempts").insert({
    user_id: userData.user.id,
    question_id: questionId,
    is_correct: isCorrect,
    time_spent: timeSpent,
  });

  revalidatePath(`/webtests/${questionId}`);
  redirect(`/webtests/${questionId}?status=${isCorrect ? "correct" : "incorrect"}`);
}
