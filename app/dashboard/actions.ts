"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { dashboardCompanySchema, dashboardEsEntrySchema } from "@/lib/validation/schemas/forms";

export async function createEsEntryAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return redirect("/login");

  const parsed = dashboardEsEntrySchema.parse({
    title: formData.get("title"),
    status: formData.get("status"),
    content_md: formData.get("content_md"),
  });

  const { error } = await supabase.from("es_entries").insert({
    user_id: user.id,
    title: parsed.title,
    status: parsed.status,
    content_md: parsed.content_md,
  });

  if (error) throw error;

  revalidatePath("/dashboard");
}

export async function createCompanyAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return redirect("/login");

  const parsed = dashboardCompanySchema.parse({
    name: formData.get("name"),
    url: formData.get("url"),
    stage: formData.get("stage"),
  });

  const { error } = await supabase.from("companies").insert({
    user_id: user.id,
    name: parsed.name,
    url: parsed.url,
    stage: parsed.stage,
  });

  if (error) throw error;

  revalidatePath("/dashboard");
}
