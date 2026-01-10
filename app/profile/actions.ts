"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { profileFormSchema } from "@/lib/validation/schemas/forms";
import { MAX_TEXT_LEN, tooLong, required } from "@/app/_components/validation";

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase client unavailable");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const profileValidation = profileFormSchema.safeParse({
    full_name: formData.get("full_name"),
    university: formData.get("university"),
    faculty: formData.get("faculty"),
    avatar_id: formData.get("avatar_id"),
    target_industry: formData.get("target_industry"),
    career_axis: formData.get("career_axis"),
    goal_state: formData.get("goal_state"),
  });
  if (!profileValidation.success) throw new Error(required("氏名"));

  const checkLen = (value: string | null, label: string) => {
    if (value && value.length > MAX_TEXT_LEN) throw new Error(tooLong(label));
  };

  checkLen(profileValidation.data.full_name, "氏名");
  checkLen(profileValidation.data.university ?? null, "大学");
  checkLen(profileValidation.data.faculty ?? null, "学部/学科");
  checkLen(profileValidation.data.avatar_id ?? null, "アバター");
  checkLen(profileValidation.data.target_industry ?? null, "志望業界");
  checkLen(profileValidation.data.career_axis ?? null, "就活の軸");
  checkLen(profileValidation.data.goal_state ?? null, "就活で達成したい状態");

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: userData.user.id,
      full_name: profileValidation.data.full_name,
      university: profileValidation.data.university ?? null,
      faculty: profileValidation.data.faculty ?? null,
      avatar_id: profileValidation.data.avatar_id ?? null,
      target_industry: profileValidation.data.target_industry ?? null,
      career_axis: profileValidation.data.career_axis ?? null,
      goal_state: profileValidation.data.goal_state ?? null,
    })
    .eq("id", userData.user.id);
  if (error) throw error;

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
