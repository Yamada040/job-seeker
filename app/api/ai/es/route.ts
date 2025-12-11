import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, summary } = body ?? {};
  if (!id || !summary) {
    return NextResponse.json({ error: "id and summary are required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("es_entries")
    .update({ ai_summary: typeof summary === "string" ? summary : JSON.stringify(summary) })
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
