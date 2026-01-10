"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";
import { companyFormSchema } from "@/lib/validation/schemas/forms";
import { MAX_TEXT_LEN, tooLong, required } from "@/app/_components/validation";
import { awardXp } from "@/lib/xp/award-xp";

const checkLen = (value: string | null, label: string) => {
  if (value && value.length > MAX_TEXT_LEN) {
    throw new Error(tooLong(label));
  }
};

export async function createCompany(formData: FormData) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const parsed = companyFormSchema.safeParse({
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
  if (!parsed.success) throw new Error(required("企業名"));

  checkLen(parsed.data.name, "企業名");
  checkLen(parsed.data.industry ?? null, "業界");
  checkLen(parsed.data.url ?? null, "企業サイトURL");
  checkLen(parsed.data.mypage_id ?? null, "マイページID");
  checkLen(parsed.data.mypage_url ?? null, "マイページURL");
  checkLen(parsed.data.stage ?? null, "選考状況");

  const payload = {
    user_id: userData.user.id,
    name: parsed.data.name,
    industry: parsed.data.industry ?? null,
    url: parsed.data.url ?? null,
    mypage_id: parsed.data.mypage_id ?? null,
    mypage_url: parsed.data.mypage_url ?? null,
    memo: parsed.data.memo ?? null,
    stage: parsed.data.stage ?? null,
    preference: parsed.data.preference ?? null,
    favorite: parsed.data.favorite,
  };

  const { data, error } = await supabase.from("companies").insert(payload).select("id").single();
  if (error || !data?.id) throw error || new Error("作成に失敗しました");

  await awardXp(userData.user.id, "company_new", { refId: data.id, supabase });
  revalidatePath("/dashboard");

  revalidatePath("/companies");
  redirect("/companies");
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = await createSupabaseActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const parsed = companyFormSchema.safeParse({
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
  if (!parsed.success) throw new Error(required("企業名"));

  checkLen(parsed.data.name, "企業名");
  checkLen(parsed.data.industry ?? null, "業界");
  checkLen(parsed.data.url ?? null, "企業サイトURL");
  checkLen(parsed.data.mypage_id ?? null, "マイページID");
  checkLen(parsed.data.mypage_url ?? null, "マイページURL");
  checkLen(parsed.data.stage ?? null, "選考状況");

  const payload = {
    name: parsed.data.name,
    industry: parsed.data.industry ?? null,
    url: parsed.data.url ?? null,
    mypage_id: parsed.data.mypage_id ?? null,
    mypage_url: parsed.data.mypage_url ?? null,
    memo: parsed.data.memo ?? null,
    stage: parsed.data.stage ?? null,
    preference: parsed.data.preference ?? null,
    favorite: parsed.data.favorite,
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
