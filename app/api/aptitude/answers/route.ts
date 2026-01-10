import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";
import { answersPayloadSchema } from "@/lib/validation/schemas/api";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = answersPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "answers is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("aptitude_results")
    .insert({ user_id: userData.user.id, answers: parsed.data.answers })
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    return NextResponse.json({ error: error?.message ?? "failed to insert" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
