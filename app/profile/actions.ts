"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { MAX_TEXT_LEN, tooLong } from "@/app/_components/validation";

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase client unavailable");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Not authenticated");

  const full_name = (formData.get("full_name") as string | null) ?? null;
  const university = (formData.get("university") as string | null) ?? null;
  const faculty = (formData.get("faculty") as string | null) ?? null;
  const avatar_id = (formData.get("avatar_id") as string | null) ?? null;
  const target_industry = (formData.get("target_industry") as string | null) ?? null;
  const career_axis = (formData.get("career_axis") as string | null) ?? null;
  const goal_state = (formData.get("goal_state") as string | null) ?? null;

  const checkLen = (value: string | null, label: string) => {
    if (value && value.length > MAX_TEXT_LEN) throw new Error(tooLong(label));
  };

  checkLen(full_name, "氏名");
  checkLen(university, "大学");
  checkLen(faculty, "学部/学科");
  checkLen(avatar_id, "アバター");
  checkLen(target_industry, "志望業界");
  checkLen(career_axis, "就活の軸");
  checkLen(goal_state, "就活で達成したい状態");

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: userData.user.id,
      full_name,
      university,
      faculty,
      avatar_id,
      target_industry,
      career_axis,
      goal_state,
    })
    .eq("id", userData.user.id);
  if (error) throw error;

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
