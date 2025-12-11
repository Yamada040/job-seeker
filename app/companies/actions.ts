"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";

export async function createCompany(formData: FormData) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const name = (formData.get("name") as string | null)?.trim();
  if (!name) {
    throw new Error("企業名は必須です");
  }

  const payload = {
    user_id: userData.user.id,
    name,
    url: (formData.get("url") as string | null) || null,
    mypage_id: (formData.get("mypage_id") as string | null) || null,
    mypage_url: (formData.get("mypage_url") as string | null) || null,
    memo: (formData.get("memo") as string | null) || null,
    stage: (formData.get("stage") as string | null) || null,
    preference: formData.get("preference") ? Number(formData.get("preference")) : null,
    favorite: formData.get("favorite") === "on",
  };

  const { error } = await supabase.from("companies").insert(payload);
  if (error) throw error;

  revalidatePath("/companies");
  redirect("/companies");
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const name = (formData.get("name") as string | null)?.trim();
  if (!name) {
    throw new Error("企業名は必須です");
  }

  const payload = {
    name,
    url: (formData.get("url") as string | null) || null,
    mypage_id: (formData.get("mypage_id") as string | null) || null,
    mypage_url: (formData.get("mypage_url") as string | null) || null,
    memo: (formData.get("memo") as string | null) || null,
    stage: (formData.get("stage") as string | null) || null,
    preference: formData.get("preference") ? Number(formData.get("preference")) : null,
    favorite: formData.get("favorite") === "on",
  };

  const { error } = await supabase.from("companies").update(payload).eq("id", id).eq("user_id", userData.user.id);
  if (error) throw error;

  revalidatePath(`/companies/${id}`);
  revalidatePath("/companies");
  redirect(`/companies/${id}`);
}

export async function deleteCompany(id: string) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const { error } = await supabase.from("companies").delete().eq("id", id).eq("user_id", userData.user.id);
  if (error) throw error;

  revalidatePath("/companies");
  redirect("/companies");
}
