"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { profileFormSchema } from "@/lib/validation/schemas/forms";

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase client unavailable");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const parsed = profileFormSchema.parse({
    full_name: formData.get("full_name"),
    university: formData.get("university"),
    faculty: formData.get("faculty"),
    avatar_id: formData.get("avatar_id"),
  });

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: userData.user.id,
      full_name: parsed.full_name ?? null,
      university: parsed.university ?? null,
      faculty: parsed.faculty ?? null,
      avatar_id: parsed.avatar_id ?? null,
    })
    .eq("id", userData.user.id);
  if (error) throw error;

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
