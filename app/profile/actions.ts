"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";

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
    })
    .eq("id", userData.user.id);
  if (error) throw error;

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
