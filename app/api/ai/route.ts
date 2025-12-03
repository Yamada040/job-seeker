import { NextRequest, NextResponse } from "next/server";

import { createAiClient } from "@/lib/ai/client";
import { AiPromptKind } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, kind } = body as { input?: string; kind?: AiPromptKind };

    if (!input || !kind) {
      return NextResponse.json({ error: "input and kind are required" }, { status: 400 });
    }

    const client = createAiClient();
    const result = await client.call(input, kind);

    return NextResponse.json({ provider: client.provider, ...result });
  } catch (error) {
    console.error("AI API error", error);
    return NextResponse.json({ error: "failed to call AI" }, { status: 500 });
  }
}
