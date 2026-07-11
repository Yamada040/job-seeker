"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";
import { webtestAnswerFormSchema, webtestQuestionFormSchema } from "@/lib/validation/schemas/forms";
import { awardXp } from "@/lib/xp/award-xp";
import { SAMPLE_WEBTEST_QUESTIONS } from "./sample-questions";

export async function createWebtestQuestion(formData: FormData) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const questionData = webtestQuestionFormSchema.parse({
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

  const choicesRaw = questionData.choices || "";
  const choices =
    choicesRaw
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean) || null;

  const payload = {
    user_id: userData.user.id,
    title: questionData.title,
    body: questionData.body,
    test_type: questionData.test_type ?? null,
    choices: choices?.length ? choices : null,
    answer: questionData.answer,
    explanation: questionData.explanation ?? null,
    category: questionData.category ?? null,
    format: questionData.format ?? null,
    difficulty: questionData.difficulty ?? null,
    time_limit: questionData.time_limit ?? null,
  };

  const { data, error } = await supabase.from("webtest_questions").insert(payload).select("id").single();
  if (error || !data?.id) throw error || new Error("作成に失敗しました");

  await awardXp(userData.user.id, "webtest_question_create", { refId: data.id, supabase });
  revalidatePath("/dashboard");

  revalidatePath("/webtests");
  redirect("/webtests");
}

export async function seedSampleWebtestQuestions() {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const userId = userData.user.id;
  const titles = SAMPLE_WEBTEST_QUESTIONS.map((question) => question.title);
  const { data: existing, error: existingError } = await supabase
    .from("webtest_questions")
    .select("title")
    .eq("user_id", userId)
    .in("title", titles);
  if (existingError) throw existingError;

  const existingTitles = new Set((existing ?? []).map((question) => question.title));
  const inserts = SAMPLE_WEBTEST_QUESTIONS.filter(
    (question) => !existingTitles.has(question.title)
  ).map((question) => ({
    ...question,
    user_id: userId,
  }));

  if (inserts.length > 0) {
    const { error } = await supabase.from("webtest_questions").insert(inserts);
    if (error) throw error;
  }

  revalidatePath("/webtests");
  redirect(`/webtests?seeded=${inserts.length}`);
}

export async function submitWebtestAnswer(questionId: string, formData: FormData) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const answerData = webtestAnswerFormSchema.parse({
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
  const isCorrect = normalize(answerData.answer) === normalize(question.answer);

  const { data: attempt, error } = await supabase.from("webtest_attempts").insert({
    user_id: userData.user.id,
    question_id: questionId,
    is_correct: isCorrect,
    time_spent: answerData.time_spent ?? null,
  }).select("id").single();
  if (error || !attempt?.id) throw error || new Error("回答の保存に失敗しました");

  await awardXp(userData.user.id, "webtest_attempt_complete", { refId: attempt.id, supabase });
  revalidatePath("/dashboard");

  revalidatePath(`/webtests/${questionId}`);
  redirect(`/webtests/${questionId}?status=${isCorrect ? "correct" : "incorrect"}`);
}
