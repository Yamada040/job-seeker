import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";
import { extractEsScoreFromSavedSummary } from "@/lib/ai/es-score";
import { idAndSummarySchema } from "@/lib/validation/schemas/ai";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const requestValidation = idAndSummarySchema.safeParse(body);
  if (!requestValidation.success) {
    return NextResponse.json({ error: "id and summary are required" }, { status: 400 });
  }

  const score = extractEsScoreFromSavedSummary(requestValidation.data.summary);
  const { error } = await supabase
    .from("es_entries")
    .update({ ai_summary: requestValidation.data.summary, score })
    .eq("id", requestValidation.data.id)
    .eq("user_id", userData.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
