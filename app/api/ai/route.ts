import { NextRequest, NextResponse } from "next/server";
import { createAiClient } from "@/lib/ai/client";
import { AiPromptKind } from "@/lib/ai/types";
import { aiRequestSchema } from "@/lib/validation/schemas/ai";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";
import { checkRateLimit } from "@/lib/rate-limit";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerActionClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(supabase, userData.user.id, "ai", {
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxRequests: RATE_LIMIT_MAX_REQUESTS,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSec),
          },
        },
      );
    }

    const body = await req.json().catch(() => null);
    const requestValidation = aiRequestSchema.safeParse(body);
    if (!requestValidation.success) {
      return NextResponse.json({ error: "input and kind are required (input max: 8000 chars)" }, { status: 400 });
    }

    const client = createAiClient();
    const result = await client.call(requestValidation.data.input, requestValidation.data.kind as AiPromptKind);

    return NextResponse.json({ provider: client.provider, ...result });
  } catch (error) {
    console.error("AI API error", error);
    return NextResponse.json({ error: "failed to call AI" }, { status: 500 });
  }
}
