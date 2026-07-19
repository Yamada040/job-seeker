import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";
import { companyFavoriteSchema } from "@/lib/validation/schemas/api";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const requestValidation = companyFavoriteSchema.safeParse(body);
  if (!requestValidation.success) {
    return NextResponse.json({ error: "id and favorite are required" }, { status: 400 });
  }

  const { id, favorite } = requestValidation.data;
  const { error } = await supabase.from("companies").update({ favorite }).eq("id", id).eq("user_id", userData.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
