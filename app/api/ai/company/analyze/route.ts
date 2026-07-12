import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";
import { agenticCompanyAnalysis } from "@/lib/ai/agentic-company";
import { checkRateLimit } from "@/lib/rate-limit";

// SSE（Server-Sent Events）の1イベント形式に整形する。
// "data: <JSON>\n\n" がブラウザ側でMessageEventとして受信される規格。
function sseEvent(event: Record<string, unknown>): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// 企業分析の入力は「企業名・URL・ステージ・メモ」程度の数行なので2000文字で十分
const requestSchema = z.object({
  input: z.string().trim().min(1).max(2000),
});

// Tavily検索×最大3回+複数回のLLM呼び出しを伴う最もコストの高いAIエンドポイントのため、
// 通常の/api/aiより厳しめのウィンドウ・上限にする。
const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const rateLimit = await checkRateLimit(supabase, userData.user.id, "ai_company_analyze", {
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequests: RATE_LIMIT_MAX_REQUESTS,
  });
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
      status: 429,
      headers: { "Retry-After": String(rateLimit.retryAfterSec) },
    });
  }

  const body = await req.json().catch(() => null);
  const validation = requestSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: "input is required (max: 2000 chars)" }), { status: 400 });
  }

  const { input } = validation.data;

  const stream = new ReadableStream({
    async start(controller) {
      const encode = (event: Record<string, unknown>) => controller.enqueue(new TextEncoder().encode(sseEvent(event)));

      try {
        const result = await agenticCompanyAnalysis(input, (message) => {
          encode({ type: "progress", message });
        });
        encode({ type: "result", ...result });
      } catch (err) {
        const message = err instanceof Error ? err.message : "企業分析に失敗しました。";
        encode({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
