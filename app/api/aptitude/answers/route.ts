import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";
import { answersPayloadSchema } from "@/lib/validation/schemas/api";
import { awardXp } from "@/lib/xp/award-xp";
import type { Json } from "@/lib/database.types";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const payloadValidation = answersPayloadSchema.safeParse(body);
  if (!payloadValidation.success) {
    return NextResponse.json({ error: "answers is required" }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("aptitude_results")
    .select("id")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message ?? "failed to check existing result" }, { status: 500 });
  }

  if (existing?.id) {
    return NextResponse.json({ error: "適性チェックは現在1回のみ実行できます。" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("aptitude_results")
    .insert({
      user_id: userData.user.id,
      answers: payloadValidation.data.answers as Json,
    })
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    return NextResponse.json({ error: error?.message ?? "failed to insert" }, { status: 500 });
  }

  const xpResult = await awardXp(userData.user.id, "aptitude_complete", {
    refId: data.id,
    supabase,
  });
  revalidatePath("/dashboard");

  return NextResponse.json({ id: data.id, leveledUp: xpResult.leveledUp });
}
