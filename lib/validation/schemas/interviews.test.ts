import { describe, expect, it } from "vitest";
import { interviewRequestSchema } from "./interviews";

describe("interviewRequestSchema", () => {
  it("requires a non-empty companyName", () => {
    expect(() => interviewRequestSchema.parse({ companyName: "" })).toThrow();
  });

  it("accepts questions as a bare array", () => {
    const result = interviewRequestSchema.parse({
      companyName: "テスト株式会社",
      questions: [{ question: "自己紹介して下さい", answer: "はい" }],
    });
    expect(result.questions).toEqual([{ question: "自己紹介して下さい", answer: "はい" }]);
  });

  it("accepts questions as an { items, reflection } object", () => {
    const result = interviewRequestSchema.parse({
      companyName: "テスト株式会社",
      questions: {
        items: [{ question: "強みは？", answer: "粘り強さ", rating: "good" }],
        reflection: { improvement: "もっと簡潔に話す" },
      },
    });
    expect(result.questions).toEqual({
      items: [{ question: "強みは？", answer: "粘り強さ", rating: "good" }],
      reflection: { improvement: "もっと簡潔に話す" },
    });
  });

  it("rejects an invalid rating enum value", () => {
    expect(() =>
      interviewRequestSchema.parse({
        companyName: "テスト株式会社",
        questions: [{ question: "Q", answer: "A", rating: "excellent" }],
      }),
    ).toThrow();
  });

  it("rejects a questions payload that matches neither union member", () => {
    expect(() =>
      interviewRequestSchema.parse({
        companyName: "テスト株式会社",
        questions: { items: "not-an-array" },
      }),
    ).toThrow();
  });

  it("allows interviewDate to be null", () => {
    const result = interviewRequestSchema.parse({
      companyName: "テスト株式会社",
      interviewDate: null,
    });
    expect(result.interviewDate).toBeNull();
  });
});
