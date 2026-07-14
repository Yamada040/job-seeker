import { describe, expect, it } from "vitest";
import { combineContent, parseQuestions } from "./actions-utils";

describe("parseQuestions", () => {
  it("returns an empty list when questions_json is empty", () => {
    expect(parseQuestions(null)).toEqual([]);
    expect(parseQuestions("")).toEqual([]);
  });

  it("parses valid questions and filters empty entries", () => {
    const questions = parseQuestions(
      JSON.stringify([
        { id: "q1", prompt: "志望理由", answer_md: "成長環境に魅力を感じたため" },
        { id: "empty", prompt: "  ", answer_md: "" },
      ]),
    );

    expect(questions).toEqual([
      {
        id: "q1",
        prompt: "志望理由",
        answer_md: "成長環境に魅力を感じたため",
      },
    ]);
  });

  it("fills missing optional question fields with safe defaults", () => {
    const [question] = parseQuestions(JSON.stringify([{ prompt: "自己PR" }]));

    expect(question?.id).toEqual(expect.any(String));
    expect(question?.prompt).toBe("自己PR");
    expect(question?.answer_md).toBe("");
  });

  it("throws a clear error for malformed JSON", () => {
    expect(() => parseQuestions("{broken")).toThrow("questions_json must be valid JSON");
  });
});

describe("combineContent", () => {
  it("returns fallback content when no questions exist", () => {
    expect(combineContent([], "既存本文")).toBe("既存本文");
  });

  it("combines prompt and answer blocks while trimming empty lines", () => {
    const content = combineContent(
      [
        { id: "q1", prompt: " 志望理由 ", answer_md: " 回答1 " },
        { id: "q2", prompt: "", answer_md: "回答2" },
      ],
      "fallback",
    );

    expect(content).toBe("志望理由\n回答1\n\n回答2");
  });
});
