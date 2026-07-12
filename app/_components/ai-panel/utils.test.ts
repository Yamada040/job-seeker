import { describe, expect, it } from "vitest";
import { buildCopyText, sanitizeMarkdown } from "./utils";

describe("sanitizeMarkdown", () => {
  it("strips heading markers of all levels", () => {
    expect(sanitizeMarkdown("# 見出し1")).toBe("見出し1");
    expect(sanitizeMarkdown("###### 見出し6")).toBe("見出し6");
  });

  it("normalizes bullet markers to a single style", () => {
    expect(sanitizeMarkdown("- item")).toBe("・item");
    expect(sanitizeMarkdown("* item")).toBe("・item");
    expect(sanitizeMarkdown("・item")).toBe("・item");
  });

  it("removes bold markers", () => {
    expect(sanitizeMarkdown("これは**強調**テキストです")).toBe("これは強調テキストです");
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeMarkdown("  text  ")).toBe("text");
  });

  it("handles multiple rules mixed across lines", () => {
    const input = "## タイトル\n- **重要**な項目\n・もう一つの項目\n";
    expect(sanitizeMarkdown(input)).toBe("タイトル\n・重要な項目\n・もう一つの項目");
  });
});

describe("buildCopyText", () => {
  it("returns only the sanitized summary when there are no bullet points", () => {
    expect(buildCopyText({ summary: "これは**要約**です" })).toBe("これは要約です");
  });

  it("returns only the bullet points when summary is empty", () => {
    expect(buildCopyText({ summary: "", bulletPoints: ["a", "b"] })).toBe("・a\n・b");
  });

  it("joins summary and bullet points when both are present", () => {
    expect(buildCopyText({ summary: "概要", bulletPoints: ["a"] })).toBe("概要\n\n・a");
  });

  it("returns an empty string for an empty response", () => {
    expect(buildCopyText({ summary: "" })).toBe("");
  });
});
