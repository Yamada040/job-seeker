"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";
import { MAX_TEXT_LEN, tooLong, required } from "@/app/_components/validation";

const checkLen = (value: string | null, label: string) => {
  if (value && value.length > MAX_TEXT_LEN) {
    throw new Error(tooLong(label));
  }
};

export async function createCompany(formData: FormData) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const name = (formData.get("name") as string | null)?.trim();
  if (!name) throw new Error(required("企業名"));

  const industry = ((formData.get("industry") as string | null) || null)?.trim() || null;
  const url = ((formData.get("url") as string | null) || null)?.trim() || null;
  const mypage_id = ((formData.get("mypage_id") as string | null) || null)?.trim() || null;
  const mypage_url = ((formData.get("mypage_url") as string | null) || null)?.trim() || null;
  const stage = ((formData.get("stage") as string | null) || null)?.trim() || null;

  checkLen(name, "企業名");
  checkLen(industry, "業界");
  checkLen(url, "企業サイトURL");
  checkLen(mypage_id, "マイページID");
  checkLen(mypage_url, "マイページURL");
  checkLen(stage, "選考状況");

  const payload = {
    user_id: userData.user.id,
    name,
    industry,
    url,
    mypage_id,
    mypage_url,
    memo: (formData.get("memo") as string | null) || null,
    stage,
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
  if (!name) throw new Error(required("企業名"));

  const industry = ((formData.get("industry") as string | null) || null)?.trim() || null;
  const url = ((formData.get("url") as string | null) || null)?.trim() || null;
  const mypage_id = ((formData.get("mypage_id") as string | null) || null)?.trim() || null;
  const mypage_url = ((formData.get("mypage_url") as string | null) || null)?.trim() || null;
  const stage = ((formData.get("stage") as string | null) || null)?.trim() || null;

  checkLen(name, "企業名");
  checkLen(industry, "業界");
  checkLen(url, "企業サイトURL");
  checkLen(mypage_id, "マイページID");
  checkLen(mypage_url, "マイページURL");
  checkLen(stage, "選考状況");

  const payload = {
    name,
    industry,
    url,
    mypage_id,
    mypage_url,
    memo: (formData.get("memo") as string | null) || null,
    stage,
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
