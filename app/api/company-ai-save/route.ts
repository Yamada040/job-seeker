import { NextRequest, NextResponse } from "next/server";
import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, summary } = body as { id?: string; summary?: any };

    if (!id || !summary) {
      return NextResponse.json({ error: "id and summary are required" }, { status: 400 });
    }

    const supabase = await createSupabaseActionClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client unavailable" }, { status: 500 });
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("companies")
      .update({ ai_summary: summary })
      .eq("id", id)
      .eq("user_id", userData.user.id);

    if (error) {
      console.error("Failed to save AI summary:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save AI summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
