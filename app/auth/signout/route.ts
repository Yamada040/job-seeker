import { NextResponse } from "next/server";

import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";
import { ROUTES } from "@/lib/constants/routes";

export async function GET(request: Request) {
  const supabase = await createSupabaseActionClient();
  await supabase.auth.signOut({ scope: "global" });

  return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
}
