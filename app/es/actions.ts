"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";
import { esFormSchema, esQuestionsSchema } from "@/lib/validation/schemas/forms";

type Question = { id: string; prompt: string; answer_md: string };

function parseQuestions(questionsJson: string | null): Question[] {
  if (!questionsJson) return [];
  try {
    const parsed = JSON.parse(questionsJson);
    const validated = esQuestionsSchema.parse(parsed);
    return validated
      .map((q) => ({
        id: typeof q?.id === "string" ? q.id : randomUUID(),
        prompt: typeof q?.prompt === "string" ? q.prompt : "",
        answer_md: typeof q?.answer_md === "string" ? q.answer_md : "",
      }))
      .filter((q) => q.prompt.trim() || q.answer_md.trim());
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("questions_json must be valid JSON");
    }
    throw error;
  }
}

function combineContent(questions: Question[], fallback: string) {
  if (!questions.length) return fallback;
  return questions
    .map((q) => {
      const prompt = q.prompt?.trim() ?? "";
      const answer = q.answer_md?.trim() ?? "";
      return [prompt, answer].filter(Boolean).join("\n");
    })
    .filter(Boolean)
    .join("\n\n");
}

export async function createEs(formData: FormData) {
  const supabase = await createSupabaseActionClient();
  if (!supabase) throw new Error("Supabase client unavailable");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const parsed = esFormSchema.parse({
    company_name: formData.get("company_name"),
    selection_status: formData.get("selection_status"),
    company_url: formData.get("company_url"),
    memo: formData.get("memo"),
    deadline: formData.get("deadline"),
    title: formData.get("title"),
    content_md: formData.get("content_md"),
    tags: formData.get("tags"),
    questions_json: formData.get("questions_json"),
    intent: formData.get("intent"),
  });
  const questions = parseQuestions(parsed.questions_json ?? null);
  const nextStatus = parsed.intent === "submit" ? "submitted" : "draft";

  const tags = parsed.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (nextStatus === "submitted") {
    if (!parsed.company_name) throw new Error("提出には企業名が必要です");
    if (!parsed.selection_status) throw new Error("提出には職種/募集枠が必要です");
    if (!parsed.deadline) throw new Error("提出日を入力してください");
  }

  const combinedContent = combineContent(questions, parsed.content_md);

  const payload = {
    user_id: userData.user.id,
    company_name: parsed.company_name ?? null,
    selection_status: parsed.selection_status ?? null,
    company_url: parsed.company_url ?? null,
    memo: parsed.memo ?? null,
    deadline: parsed.deadline ?? null,
    title: parsed.title,
    status: nextStatus,
    content_md: combinedContent,
    questions,
    tags: tags.length ? tags : null,
  };

  const { error } = await supabase.from("es_entries").insert(payload);
  if (error) throw error;

  revalidatePath("/es");
  redirect("/es");
}

export async function updateEs(id: string, formData: FormData) {
  const supabase = await createSupabaseActionClient();
  if (!supabase) throw new Error("Supabase client unavailable");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const parsed = esFormSchema.parse({
    company_name: formData.get("company_name"),
    selection_status: formData.get("selection_status"),
    company_url: formData.get("company_url"),
    memo: formData.get("memo"),
    deadline: formData.get("deadline"),
    title: formData.get("title"),
    content_md: formData.get("content_md"),
    tags: formData.get("tags"),
    questions_json: formData.get("questions_json"),
    intent: formData.get("intent"),
  });
  const questions = parseQuestions(parsed.questions_json ?? null);
  const nextStatus = parsed.intent === "submit" ? "submitted" : "draft";

  const tags = parsed.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (nextStatus === "submitted") {
    if (!parsed.company_name) throw new Error("提出には企業名が必要です");
    if (!parsed.selection_status) throw new Error("提出には職種/募集枠が必要です");
    if (!parsed.deadline) throw new Error("提出日を入力してください");
  }

  const combinedContent = combineContent(questions, parsed.content_md);

  const { error } = await supabase
    .from("es_entries")
    .update({
      company_name: parsed.company_name ?? null,
      selection_status: parsed.selection_status ?? null,
      company_url: parsed.company_url ?? null,
      memo: parsed.memo ?? null,
      deadline: parsed.deadline ?? null,
      title: parsed.title,
      status: nextStatus,
      content_md: combinedContent,
      tags: tags.length ? tags : null,
      questions,
    })
    .eq("id", id)
    .eq("user_id", userData.user.id);
  if (error) throw error;

  revalidatePath("/es");
  revalidatePath(`/es/${id}`);
}

export async function deleteEs(id: string) {
  const supabase = await createSupabaseActionClient();
  if (!supabase) throw new Error("Supabase client unavailable");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Not authenticated");

  const { error } = await supabase.from("es_entries").delete().eq("id", id).eq("user_id", userData.user.id);
  if (error) throw error;
  revalidatePath("/es");
  redirect("/es");
}
