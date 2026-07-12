import { NextRequest, NextResponse } from "next/server";
import { createAiClient } from "@/lib/ai/client";
import { AiPromptKind } from "@/lib/ai/types";
import { aiRequestSchema } from "@/lib/validation/schemas/ai";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;

const aiRateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkAiRateLimit(userId: string) {
  const now = Date.now();
  const current = aiRateLimitStore.get(userId);

  if (!current || current.resetAt <= now) {
    aiRateLimitStore.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true as const, retryAfterSec: 0 };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false as const,
      retryAfterSec: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  aiRateLimitStore.set(userId, current);
  return { allowed: true as const, retryAfterSec: 0 };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerActionClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkAiRateLimit(userData.user.id);
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
