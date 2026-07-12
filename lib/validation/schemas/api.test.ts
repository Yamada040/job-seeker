import { describe, expect, it } from "vitest";
import { answersPayloadSchema, calendarEventSchema } from "./api";

describe("answersPayloadSchema", () => {
  it("accepts a record with arbitrary keys/values", () => {
    const result = answersPayloadSchema.parse({ answers: { q1: "a", q2: 2, q3: true } });
    expect(result.answers).toEqual({ q1: "a", q2: 2, q3: true });
  });

  it("rejects a missing answers field", () => {
    expect(() => answersPayloadSchema.parse({})).toThrow();
  });
});

describe("calendarEventSchema", () => {
  it("requires date and title", () => {
    expect(() => calendarEventSchema.parse({ title: "面接" })).toThrow();
    expect(() => calendarEventSchema.parse({ date: "2026-07-13" })).toThrow();
  });

  it("allows company/type/time to be null", () => {
    const result = calendarEventSchema.parse({
      date: "2026-07-13",
      title: "面接",
      company: null,
      type: null,
      time: null,
    });
    expect(result.company).toBeNull();
    expect(result.type).toBeNull();
    expect(result.time).toBeNull();
  });

  it("allows company/type/time to be omitted", () => {
    const result = calendarEventSchema.parse({ date: "2026-07-13", title: "面接" });
    expect(result.company).toBeUndefined();
  });
});
