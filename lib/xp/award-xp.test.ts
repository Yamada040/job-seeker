import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { createSupabaseMock } from "@/test/helpers/supabase-mock";
import { awardXp } from "./award-xp";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ set: vi.fn() })),
}));

beforeEach(() => {
  vi.mocked(cookies).mockClear();
  vi.mocked(cookies).mockImplementation(
    async () => ({ set: vi.fn() }) as unknown as Awaited<ReturnType<typeof cookies>>,
  );
});

describe("awardXp", () => {
  it("returns NOT_AWARDED for an action outside XP_CONFIG, without touching supabase", async () => {
    const mock = createSupabaseMock([]);

    const result = await awardXp("user-1", "unknown_action" as never, { supabase: mock.client as never });

    expect(result).toEqual({ awarded: false, leveledUp: null });
    expect(mock.client.from).not.toHaveBeenCalled();
  });

  it("returns NOT_AWARDED when requireRefId is true and no refId is given", async () => {
    const mock = createSupabaseMock([]);

    const result = await awardXp("user-1", "es_submitted", { supabase: mock.client as never });

    expect(result).toEqual({ awarded: false, leveledUp: null });
    expect(mock.client.from).not.toHaveBeenCalled();
  });

  it("returns NOT_AWARDED when a row with the same user/action/refId already exists", async () => {
    const mock = createSupabaseMock([{ data: { id: "existing-log" } }]);

    const result = await awardXp("user-1", "es_submitted", { refId: "es-1", supabase: mock.client as never });

    expect(result).toEqual({ awarded: false, leveledUp: null });
  });

  it("returns NOT_AWARDED when the daily cap has been reached", async () => {
    const mock = createSupabaseMock([
      { data: null }, // duplicate check: no existing row
      { count: 5 }, // daily cap check: company_new cap is 5
    ]);

    const result = await awardXp("user-1", "company_new", { refId: "company-1", supabase: mock.client as never });

    expect(result).toEqual({ awarded: false, leveledUp: null });
  });

  it("returns NOT_AWARDED when a cooldown-protected action was recently logged", async () => {
    const mock = createSupabaseMock([
      { data: { id: "recent-log" } }, // cooldown check finds a recent row
    ]);

    const result = await awardXp("user-1", "aptitude_complete", { supabase: mock.client as never });

    expect(result).toEqual({ awarded: false, leveledUp: null });
  });

  it("awards xp and reports a level-up when the xp boundary is crossed", async () => {
    const mock = createSupabaseMock([
      { data: null }, // duplicate check: no existing row
      { data: { xp: 24 } }, // current profile xp
      {}, // profiles upsert
      {}, // xp_logs insert
    ]);

    const result = await awardXp("user-1", "es_submitted", { refId: "es-1", supabase: mock.client as never });

    expect(result).toEqual({ awarded: true, leveledUp: 2 });

    const upsertCall = mock.callsFor("upsert")[0];
    expect(upsertCall.table).toBe("profiles");
    expect(upsertCall.args[0]).toEqual({ id: "user-1", xp: 49, level: 2 });

    const insertCall = mock.callsFor("insert")[0];
    expect(insertCall.table).toBe("xp_logs");
    expect(insertCall.args[0]).toEqual({ user_id: "user-1", xp: 25, action: "es_submitted", ref_id: "es-1" });
  });

  it("awards xp without a level-up when the xp stays within the same level", async () => {
    const mock = createSupabaseMock([
      { data: null }, // duplicate check
      { count: 0 }, // daily cap check: company_new cap is 5
      { data: { xp: 0 } }, // current profile xp
      {}, // profiles upsert
      {}, // xp_logs insert
    ]);

    const result = await awardXp("user-1", "company_new", { refId: "company-1", supabase: mock.client as never });

    expect(result).toEqual({ awarded: true, leveledUp: null });
  });

  it("still returns awarded:true when writing the xp-status cookie throws", async () => {
    vi.mocked(cookies).mockImplementation(async () => {
      throw new Error("cannot mutate cookies outside a request context");
    });
    const mock = createSupabaseMock([{ data: null }, { data: { xp: 0 } }, {}, {}]);

    const result = await awardXp("user-1", "es_submitted", { refId: "es-1", supabase: mock.client as never });

    expect(result.awarded).toBe(true);
  });
});
