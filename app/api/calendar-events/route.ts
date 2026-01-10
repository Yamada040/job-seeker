import { NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";
import { calendarEventSchema } from "@/lib/validation/schemas/api";

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

  const body = await request.json().catch(() => null);
  const eventValidation = calendarEventSchema.safeParse(body);
  if (!eventValidation.success) {
    return NextResponse.json({ error: "date と title は必須です" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      user_id: userData.user.id,
      date: eventValidation.data.date,
      title: eventValidation.data.title,
      company: eventValidation.data.company ?? null,
      type: eventValidation.data.type ?? "other",
      time: eventValidation.data.time ?? null,
    })
    .select()
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "failed to insert" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
