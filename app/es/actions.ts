"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";
import { esFormSchema, esQuestionsSchema } from "@/lib/validation/schemas/forms";
import { awardXp } from "@/lib/xp/award-xp";

type Question = { id: string; prompt: string; answer_md: string };

function parseQuestions(questionsJson: string | null): Question[] {
  if (!questionsJson) return [];
  try {
    const questionsValue = JSON.parse(questionsJson);
    const validated = esQuestionsSchema.parse(questionsValue);
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

  const esData = esFormSchema.parse({
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
  const questions = parseQuestions(esData.questions_json ?? null);
  const nextStatus = esData.intent === "submit" ? "submitted" : "draft";

  const tags = esData.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (nextStatus === "submitted") {
    if (!esData.company_name) throw new Error("提出には企業名が必要です");
    // if (!selection_status) throw new Error("提出には職種/募集枠が必要です");
    // if (!deadline) throw new Error("提出日を入力してください");
  }

  const combinedContent = combineContent(questions, esData.content_md);

  const payload = {
    user_id: userData.user.id,
    company_name: esData.company_name ?? null,
    selection_status: esData.selection_status ?? null,
    company_url: esData.company_url ?? null,
    memo: esData.memo ?? null,
    deadline: esData.deadline ?? null,
    title: esData.title,
    status: nextStatus,
    content_md: combinedContent,
    questions,
    tags: tags.length ? tags : null,
  };

  const { data, error } = await supabase.from("es_entries").insert(payload).select("id").single();
  if (error || !data?.id) throw error || new Error("作成に失敗しました");

  if (nextStatus === "submitted") {
    await awardXp(userData.user.id, "es_submitted", { refId: data.id, supabase });
    revalidatePath("/dashboard");
  }

  revalidatePath("/es");
  redirect("/es");
}

export async function updateEs(id: string, formData: FormData) {
  const supabase = await createSupabaseActionClient();
  if (!supabase) throw new Error("Supabase client unavailable");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const esData = esFormSchema.parse({
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
  const questions = parseQuestions(esData.questions_json ?? null);
  const nextStatus = esData.intent === "submit" ? "submitted" : "draft";

  const tags = esData.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (nextStatus === "submitted") {
    if (!esData.company_name) throw new Error("提出には企業名が必要です");
    // if (!selection_status) throw new Error("提出には職種/募集枠が必要です");
    // if (!deadline) throw new Error("提出日を入力してください");
  }

  const combinedContent = combineContent(questions, esData.content_md);

  const { error } = await supabase
    .from("es_entries")
    .update({
      company_name: esData.company_name ?? null,
      selection_status: esData.selection_status ?? null,
      company_url: esData.company_url ?? null,
      memo: esData.memo ?? null,
      deadline: esData.deadline ?? null,
      title: esData.title,
      status: nextStatus,
      content_md: combinedContent,
      tags: tags.length ? tags : null,
      questions,
    })
    .eq("id", id)
    .eq("user_id", userData.user.id);
  if (error) throw error;

  if (nextStatus === "submitted") {
    await awardXp(userData.user.id, "es_submitted", { refId: id, supabase });
    revalidatePath("/dashboard");
  }

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
