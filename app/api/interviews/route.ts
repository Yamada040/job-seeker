import { NextResponse } from "next/server";

import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const companyName = body?.companyName as string | undefined;
  if (!companyName) {
    return NextResponse.json({ error: "companyName is required" }, { status: 400 });
  }

  const payload = {
    user_id: userData.user.id,
    company_name: companyName,
    interview_title: body?.interviewTitle || null,
    interview_date: body?.interviewDate || null,
    stage: body?.stage || null,
    questions: body?.questions || null,
    self_review: body?.selfReview || null,
  };

  const { data, error } = await supabase.from("interview_logs").insert(payload).select("id").single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
