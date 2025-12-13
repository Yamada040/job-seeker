import { NextResponse } from "next/server";

import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id = body?.id as string | undefined;
  const summary = body?.summary ?? null;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase
    .from("interview_logs")
    .update({ ai_summary: summary })
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
