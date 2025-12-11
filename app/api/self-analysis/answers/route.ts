import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { answers } = body ?? {};
  if (!answers) {
    return NextResponse.json({ error: "answers is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("self_analysis_results")
    .insert({ user_id: userData.user.id, answers })
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    return NextResponse.json({ error: error?.message ?? "failed to insert" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
