import { NextResponse } from "next/server";

import { isDeveloperUserId } from "@/lib/auth/developer";
import { createSupabaseServerReadonlyClient } from "@/lib/supabase/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServerReadonlyClient();
  const { data: userData } = await supabase.auth.getUser();
  const isDeveloper = isDeveloperUserId(userData.user?.id);

  return NextResponse.json({ isDeveloper });
}
