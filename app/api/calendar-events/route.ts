import { NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, title, company, type, time } = body ?? {};

  if (!date || !title) {
    return NextResponse.json({ error: "date と title は必須です" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      user_id: userData.user.id,
      date,
      title,
      company,
      type: type ?? "other",
      time: time ?? null,
    })
    .select()
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "failed to insert" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
