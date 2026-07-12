import { describe, expect, it } from "vitest";
import { ANSWER_VALUE_MAX_LENGTH, ANSWERS_MAX_KEYS, answersPayloadSchema, calendarEventSchema } from "./api";

describe("answersPayloadSchema", () => {
  it("accepts a record with arbitrary keys/values", () => {
    const result = answersPayloadSchema.parse({ answers: { q1: "a", q2: 2, q3: true } });
    expect(result.answers).toEqual({ q1: "a", q2: 2, q3: true });
  });

  it("rejects a missing answers field", () => {
    expect(() => answersPayloadSchema.parse({})).toThrow();
  });

  it("rejects too many answer keys", () => {
    const answers = Object.fromEntries(Array.from({ length: ANSWERS_MAX_KEYS + 1 }, (_, index) => [`q${index}`, "a"]));

    expect(() => answersPayloadSchema.parse({ answers })).toThrow(`回答は${ANSWERS_MAX_KEYS}項目以内`);
  });

  it("rejects oversized answer values", () => {
    expect(() =>
      answersPayloadSchema.parse({
        answers: {
          q1: "a".repeat(ANSWER_VALUE_MAX_LENGTH + 1),
        },
      }),
    ).toThrow(`回答は1項目あたり${ANSWER_VALUE_MAX_LENGTH}文字以内`);
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
