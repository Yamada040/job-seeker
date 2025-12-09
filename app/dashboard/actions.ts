"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";

export async function createEsEntryAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("Not authenticated");

  const title = (formData.get("title") as string) ?? "";
  const status = (formData.get("status") as string) ?? "下書き";
  const content_md = (formData.get("content_md") as string) ?? "";

  if (!title.trim()) throw new Error("タイトルは必須です");

  const { error } = await supabase.from("es_entries").insert({
    user_id: user.id,
    title,
    status,
    content_md,
  });

  if (error) throw error;

  revalidatePath("/dashboard");
}

export async function createCompanyAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("Not authenticated");

  const name = (formData.get("name") as string) ?? "";
  const url = (formData.get("url") as string) ?? "";
  const stage = (formData.get("stage") as string) ?? "未エントリー";

  if (!name.trim()) throw new Error("企業名は必須です");

  const { error } = await supabase.from("companies").insert({
    user_id: user.id,
    name,
    url,
    stage,
  });

  if (error) throw error;

  revalidatePath("/dashboard");
}
