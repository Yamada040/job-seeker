import { NextResponse } from "next/server";
import { createSupabaseActionClient } from "@/lib/supabase/server-action";

export async function POST(request: Request) {
  try {
    const { id, summary } = (await request.json()) as { id?: string; summary?: any };
    if (!id || !summary) {
      return NextResponse.json({ error: "id and summary are required" }, { status: 400 });
    }

    const supabase = await createSupabaseActionClient();
    if (!supabase) throw new Error("supabase unavailable");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("es_entries")
      .update({ ai_summary: summary })
      .eq("id", id)
      .eq("user_id", userData.user.id);

    if (error) {
      console.error("es ai save error", error);
      return NextResponse.json({ error: "save failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("es-ai-save error", err);
    return NextResponse.json({ error: "unexpected error" }, { status: 500 });
  }
}
