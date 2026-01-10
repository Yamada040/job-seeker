"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";
import { companyFormSchema } from "@/lib/validation/schemas/forms";

export async function createCompany(formData: FormData) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const parsed = companyFormSchema.parse({
    name: formData.get("name"),
    industry: formData.get("industry"),
    url: formData.get("url"),
    mypage_id: formData.get("mypage_id"),
    mypage_url: formData.get("mypage_url"),
    memo: formData.get("memo"),
    stage: formData.get("stage"),
    preference: formData.get("preference"),
    favorite: formData.get("favorite"),
  });

  const payload = {
    user_id: userData.user.id,
    name: parsed.name,
    industry: parsed.industry ?? null,
    url: parsed.url ?? null,
    mypage_id: parsed.mypage_id ?? null,
    mypage_url: parsed.mypage_url ?? null,
    memo: parsed.memo ?? null,
    stage: parsed.stage ?? null,
    preference: parsed.preference ?? null,
    favorite: parsed.favorite,
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

  const parsed = companyFormSchema.parse({
    name: formData.get("name"),
    industry: formData.get("industry"),
    url: formData.get("url"),
    mypage_id: formData.get("mypage_id"),
    mypage_url: formData.get("mypage_url"),
    memo: formData.get("memo"),
    stage: formData.get("stage"),
    preference: formData.get("preference"),
    favorite: formData.get("favorite"),
  });

  const payload = {
    name: parsed.name,
    industry: parsed.industry ?? null,
    url: parsed.url ?? null,
    mypage_id: parsed.mypage_id ?? null,
    mypage_url: parsed.mypage_url ?? null,
    memo: parsed.memo ?? null,
    stage: parsed.stage ?? null,
    preference: parsed.preference ?? null,
    favorite: parsed.favorite,
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
