"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseActionClient } from "@/lib/supabase/server-action";

export async function createCompany(formData: FormData) {
  const supabase = await createSupabaseActionClient();
  if (!supabase) throw new Error("Supabase client unavailable");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Not authenticated");

  const name = (formData.get("name") as string | null)?.trim();
  if (!name) throw new Error("企業名は必須です");

  const url = (formData.get("url") as string | null)?.trim() || null;
  const stage = (formData.get("stage") as string | null) ?? "未エントリー";
  const preference = Number(formData.get("preference")) || 3;
  const memo = (formData.get("memo") as string | null) || null;

  const { error } = await supabase.from("companies").insert({
    user_id: userData.user.id,
    name,
    url,
    stage,
    preference,
    memo,
  });
  if (error) throw error;
  revalidatePath("/companies");
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = await createSupabaseActionClient();
  if (!supabase) throw new Error("Supabase client unavailable");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Not authenticated");

  const name = (formData.get("name") as string | null)?.trim();
  const url = (formData.get("url") as string | null)?.trim() || null;
  const stage = (formData.get("stage") as string | null) ?? "未エントリー";
  const preference = Number(formData.get("preference")) || 3;
  const memo = (formData.get("memo") as string | null) || null;
  const favorite = formData.get("favorite") === "on";

  if (!name) throw new Error("企業名は必須です");

  const { error } = await supabase
    .from("companies")
    .update({ name, url, stage, preference, memo, favorite })
    .eq("id", id)
    .eq("user_id", userData.user.id);
  if (error) throw error;
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
}

export async function deleteCompany(id: string) {
  const supabase = await createSupabaseActionClient();
  if (!supabase) throw new Error("Supabase client unavailable");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Not authenticated");
  const { error } = await supabase.from("companies").delete().eq("id", id).eq("user_id", userData.user.id);
  if (error) throw error;
  revalidatePath("/companies");
  redirect("/companies");
}
