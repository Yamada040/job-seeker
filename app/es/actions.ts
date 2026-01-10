"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";
import { awardXp } from "@/lib/xp/award-xp";

type Question = { id: string; prompt: string; answer_md: string };

function parseQuestions(questionsJson: string | null): Question[] {
  if (!questionsJson) return [];
  try {
    const parsed = JSON.parse(questionsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((q) => ({
        id: typeof q?.id === "string" ? q.id : randomUUID(),
        prompt: typeof q?.prompt === "string" ? q.prompt : "",
        answer_md: typeof q?.answer_md === "string" ? q.answer_md : "",
      }))
      .filter((q) => q.prompt.trim() || q.answer_md.trim());
  } catch {
    return [];
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
  if (!userData?.user) throw new Error("Not authenticated");

  const company_name = (formData.get("company_name") as string | null)?.trim() || null;
  const selection_status = (formData.get("selection_status") as string | null)?.trim() || null; // 職種/募集枠
  const company_url = (formData.get("company_url") as string | null)?.trim() || null;
  const memo = (formData.get("memo") as string | null)?.trim() || null;
  const deadline = (formData.get("deadline") as string | null)?.trim() || null; // 提出日
  const title = (formData.get("title") as string | null)?.trim();
  const content_md = (formData.get("content_md") as string | null) ?? "";
  const tagsRaw = (formData.get("tags") as string | null) ?? "";
  const questions = parseQuestions(formData.get("questions_json") as string | null);
  const intent = (formData.get("intent") as string | null) ?? "save";
  const nextStatus = intent === "submit" ? "submitted" : "draft";

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!title) throw new Error("タイトルは必須です");
  if (nextStatus === "submitted") {
    if (!company_name) throw new Error("提出には企業名が必要です");
    // if (!selection_status) throw new Error("提出には職種/募集枠が必要です");
    // if (!deadline) throw new Error("提出日を入力してください");
  }

  const combinedContent = combineContent(questions, content_md);

  const payload = {
    user_id: userData.user.id,
    company_name,
    selection_status,
    company_url,
    memo,
    deadline,
    title,
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
  if (!userData?.user) throw new Error("Not authenticated");

  const company_name = (formData.get("company_name") as string | null)?.trim() || null; // 職種/募集枠
  const selection_status = (formData.get("selection_status") as string | null)?.trim() || null; // 職種/募集枠
  const company_url = (formData.get("company_url") as string | null)?.trim() || null;
  const memo = (formData.get("memo") as string | null)?.trim() || null;
  const deadline = (formData.get("deadline") as string | null)?.trim() || null; // 提出日
  const title = (formData.get("title") as string | null)?.trim();
  const content_md = (formData.get("content_md") as string | null) ?? "";
  const tagsRaw = (formData.get("tags") as string | null) ?? "";
  const questions = parseQuestions(formData.get("questions_json") as string | null);
  const intent = (formData.get("intent") as string | null) ?? "save";
  const nextStatus = intent === "submit" ? "submitted" : "draft";

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!title) throw new Error("タイトルは必須です");
  if (nextStatus === "submitted") {
    if (!company_name) throw new Error("提出には企業名が必要です");
    // if (!selection_status) throw new Error("提出には職種/募集枠が必要です");
    // if (!deadline) throw new Error("提出日を入力してください");
  }

  const combinedContent = combineContent(questions, content_md);

  const { error } = await supabase
    .from("es_entries")
    .update({
      company_name,
      selection_status,
      company_url,
      memo,
      deadline,
      title,
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
