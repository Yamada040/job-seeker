import { describe, expect, it } from "vitest";
import { aiRequestSchema, idAndSummarySchema } from "./ai";

describe("aiRequestSchema", () => {
  it("accepts input at exactly the 8000 char boundary", () => {
    const input = "a".repeat(8000);
    expect(aiRequestSchema.parse({ input, kind: "es_review" }).input).toHaveLength(8000);
  });

  it("rejects input exceeding the 8000 char boundary", () => {
    const input = "a".repeat(8001);
    expect(() => aiRequestSchema.parse({ input, kind: "es_review" })).toThrow();
  });

  it("rejects input that is empty after trimming", () => {
    expect(() => aiRequestSchema.parse({ input: "   ", kind: "es_review" })).toThrow();
  });

  it("rejects an invalid kind enum value", () => {
    expect(() => aiRequestSchema.parse({ input: "test", kind: "invalid_kind" })).toThrow();
  });

  it("accepts each valid kind", () => {
    const kinds = ["es_review", "company_analysis", "aptitude_analysis", "self_analysis", "interview_review"];
    for (const kind of kinds) {
      expect(() => aiRequestSchema.parse({ input: "test", kind })).not.toThrow();
    }
  });
});

describe("idAndSummarySchema", () => {
  it("requires both id and summary", () => {
    expect(() => idAndSummarySchema.parse({ id: "1" })).toThrow();
    expect(() => idAndSummarySchema.parse({ summary: "s" })).toThrow();
  });

  it("accepts a valid payload", () => {
    expect(idAndSummarySchema.parse({ id: "1", summary: "s" })).toEqual({ id: "1", summary: "s" });
  });
});
