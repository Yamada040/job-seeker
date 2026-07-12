import { vi } from "vitest";

export type MockQueryResult = { data?: unknown; count?: number | null };

export type SupabaseCallRecord = {
  table: string;
  method: "select" | "eq" | "gte" | "maybeSingle" | "upsert" | "insert";
  args: unknown[];
};

/**
 * Minimal chainable fake for the subset of the Supabase query builder used by
 * lib/xp/award-xp.ts. Each awaited query (implicit `then` or explicit
 * `.maybeSingle()`) consumes the next entry from `resultsQueue`, in the same
 * order awardXp performs its sequential awaits.
 */
export function createSupabaseMock(resultsQueue: MockQueryResult[] = []) {
  let queueIndex = 0;
  const calls: SupabaseCallRecord[] = [];

  const nextResult = (): MockQueryResult => {
    const result = resultsQueue[queueIndex] ?? { data: null, count: null };
    queueIndex += 1;
    return result;
  };

  function buildQuery(table: string) {
    const record = (method: SupabaseCallRecord["method"], args: unknown[]) => {
      calls.push({ table, method, args });
    };

    const query: Record<string, unknown> = {
      select: (...args: unknown[]) => {
        record("select", args);
        return query;
      },
      eq: (...args: unknown[]) => {
        record("eq", args);
        return query;
      },
      gte: (...args: unknown[]) => {
        record("gte", args);
        return query;
      },
      maybeSingle: (...args: unknown[]) => {
        record("maybeSingle", args);
        return Promise.resolve(nextResult());
      },
      upsert: (...args: unknown[]) => {
        record("upsert", args);
        return query;
      },
      insert: (...args: unknown[]) => {
        record("insert", args);
        return query;
      },
      then: (resolve: (value: MockQueryResult) => void, reject: (reason: unknown) => void) => {
        try {
          resolve(nextResult());
        } catch (error) {
          reject(error);
        }
      },
    };
    return query;
  }

  const from = vi.fn((table: string) => buildQuery(table));

  return {
    client: { from },
    calls,
    callsFor: (method: SupabaseCallRecord["method"]) => calls.filter((c) => c.method === method),
  };
}
