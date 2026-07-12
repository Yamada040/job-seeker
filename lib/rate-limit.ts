import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

export type RateLimitResult = { allowed: boolean; retryAfterSec: number };

export type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  // テスト用に現在時刻を注入できるようにする（デフォルトはDate.now）
  now?: () => number;
};

// api_rate_limits テーブルに永続化することで、サーバーレス環境の複数インスタンス間でも
// 一貫したレート制限を行う（従来のin-memory Mapはインスタンスごとに独立し、コールドスタートで
// リセットされてしまうため実効性が弱かった）。
export async function checkRateLimit(
  supabase: Client,
  userId: string,
  bucket: string,
  { windowMs, maxRequests, now = Date.now }: RateLimitOptions,
): Promise<RateLimitResult> {
  const nowMs = now();

  const { data: existing } = await supabase
    .from("api_rate_limits")
    .select("window_start, count")
    .eq("user_id", userId)
    .eq("bucket", bucket)
    .maybeSingle();

  const windowStartMs = existing ? new Date(existing.window_start).getTime() : 0;
  const windowExpired = !existing || nowMs - windowStartMs >= windowMs;

  if (windowExpired) {
    await supabase.from("api_rate_limits").upsert({
      user_id: userId,
      bucket,
      window_start: new Date(nowMs).toISOString(),
      count: 1,
    });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSec: Math.max(0, Math.ceil((windowStartMs + windowMs - nowMs) / 1000)),
    };
  }

  await supabase
    .from("api_rate_limits")
    .update({ count: existing.count + 1 })
    .eq("user_id", userId)
    .eq("bucket", bucket);

  return { allowed: true, retryAfterSec: 0 };
}
