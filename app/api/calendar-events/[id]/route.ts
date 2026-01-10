import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";
import { calendarEventSchema } from "@/lib/validation/schemas/api";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerActionClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = calendarEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "date と title は必須です" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .update({
      date: parsed.data.date,
      title: parsed.data.title,
      company: parsed.data.company ?? null,
      type: parsed.data.type ?? "other",
      time: parsed.data.time ?? null,
    })
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .select()
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "failed to update" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
