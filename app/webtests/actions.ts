"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";
import { webtestAnswerFormSchema, webtestQuestionFormSchema } from "@/lib/validation/schemas/forms";

export async function createWebtestQuestion(formData: FormData) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const parsed = webtestQuestionFormSchema.parse({
    title: formData.get("title"),
    body: formData.get("body"),
    answer: formData.get("answer"),
    choices: formData.get("choices"),
    test_type: formData.get("test_type"),
    explanation: formData.get("explanation"),
    category: formData.get("category"),
    format: formData.get("format"),
    difficulty: formData.get("difficulty"),
    time_limit: formData.get("time_limit"),
  });

  const choicesRaw = parsed.choices || "";
  const choices =
    choicesRaw
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean) || null;

  const payload = {
    user_id: userData.user.id,
    title: parsed.title,
    body: parsed.body,
    test_type: parsed.test_type ?? null,
    choices: choices?.length ? choices : null,
    answer: parsed.answer,
    explanation: parsed.explanation ?? null,
    category: parsed.category ?? null,
    format: parsed.format ?? null,
    difficulty: parsed.difficulty ?? null,
    time_limit: parsed.time_limit ?? null,
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

  const parsed = webtestAnswerFormSchema.parse({
    answer: formData.get("answer"),
    time_spent: formData.get("time_spent"),
  });

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
  const isCorrect = normalize(parsed.answer) === normalize(question.answer);

  await supabase.from("webtest_attempts").insert({
    user_id: userData.user.id,
    question_id: questionId,
    is_correct: isCorrect,
    time_spent: parsed.time_spent ?? null,
  });

  revalidatePath(`/webtests/${questionId}`);
  redirect(`/webtests/${questionId}?status=${isCorrect ? "correct" : "incorrect"}`);
}
