"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseActionClient } from "@/lib/supabase/server-action";

export async function createEs(formData: FormData) {
  const supabase = await createSupabaseActionClient();
  if (!supabase) throw new Error("Supabase client unavailable");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Not authenticated");

  const title = (formData.get("title") as string | null)?.trim();
  const status = (formData.get("status") as string | null) ?? "下書き";
  const content_md = (formData.get("content_md") as string | null) ?? "";
  const tagsRaw = (formData.get("tags") as string | null) ?? "";
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (!title) throw new Error("タイトルは必須です");

  const { error } = await supabase.from("es_entries").insert({
    user_id: userData.user.id,
    title,
    status,
    content_md,
    tags: tags.length ? tags : null,
  });
  if (error) throw error;
  revalidatePath("/es");
  redirect("/es");
}

export async function updateEs(id: string, formData: FormData) {
  const supabase = await createSupabaseActionClient();
  if (!supabase) throw new Error("Supabase client unavailable");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Not authenticated");

  const title = (formData.get("title") as string | null)?.trim();
  const status = (formData.get("status") as string | null) ?? "下書き";
  const content_md = (formData.get("content_md") as string | null) ?? "";
  const tagsRaw = (formData.get("tags") as string | null) ?? "";
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (!title) throw new Error("タイトルは必須です");

  const { error } = await supabase
    .from("es_entries")
    .update({ title, status, content_md, tags: tags.length ? tags : null })
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
