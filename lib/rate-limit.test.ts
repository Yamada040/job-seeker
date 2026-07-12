import { describe, expect, it } from "vitest";
import { createSupabaseMock } from "@/test/helpers/supabase-mock";
import { checkRateLimit } from "./rate-limit";

const OPTS = { windowMs: 60_000, maxRequests: 3 };

describe("checkRateLimit", () => {
  it("allows the request and starts a new window when no record exists", async () => {
    const mock = createSupabaseMock([{ data: null }]);

    const result = await checkRateLimit(mock.client as never, "user-1", "ai", { ...OPTS, now: () => 1_000_000 });

    expect(result).toEqual({ allowed: true, retryAfterSec: 0 });
    const upsertCall = mock.callsFor("upsert")[0];
    expect(upsertCall.args[0]).toEqual({
      user_id: "user-1",
      bucket: "ai",
      window_start: new Date(1_000_000).toISOString(),
      count: 1,
    });
  });

  it("starts a new window when the previous one has expired", async () => {
    const windowStart = new Date(1_000_000).toISOString();
    const mock = createSupabaseMock([{ data: { window_start: windowStart, count: 3 } }]);

    const result = await checkRateLimit(mock.client as never, "user-1", "ai", {
      ...OPTS,
      now: () => 1_000_000 + OPTS.windowMs,
    });

    expect(result).toEqual({ allowed: true, retryAfterSec: 0 });
  });

  it("allows and increments the count while under the limit", async () => {
    const windowStart = new Date(1_000_000).toISOString();
    const mock = createSupabaseMock([{ data: { window_start: windowStart, count: 1 } }]);

    const result = await checkRateLimit(mock.client as never, "user-1", "ai", { ...OPTS, now: () => 1_000_500 });

    expect(result).toEqual({ allowed: true, retryAfterSec: 0 });
    const updateCall = mock.callsFor("update")[0];
    expect(updateCall.args[0]).toEqual({ count: 2 });
  });

  it("denies the request once the limit is reached within the window", async () => {
    const windowStart = new Date(1_000_000).toISOString();
    const mock = createSupabaseMock([{ data: { window_start: windowStart, count: 3 } }]);

    const result = await checkRateLimit(mock.client as never, "user-1", "ai", { ...OPTS, now: () => 1_030_000 });

    expect(result.allowed).toBe(false);
    expect(result.retryAfterSec).toBe(30);
  });
});
