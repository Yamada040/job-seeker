import { NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";
import { idAndSummarySchema } from "@/lib/validation/schemas/ai";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const requestValidation = idAndSummarySchema.safeParse(body);
  if (!requestValidation.success) return NextResponse.json({ error: "id and summary are required" }, { status: 400 });

  const { error } = await supabase
    .from("interview_logs")
    .update({ ai_summary: requestValidation.data.summary })
    .eq("id", requestValidation.data.id)
    .eq("user_id", userData.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
