import { describe, expect, it } from "vitest";
import { extractEsScoreFromSavedSummary, extractEsScoreFromText } from "./es-score";

describe("extractEsScoreFromText", () => {
  it("extracts a 100-point total score", () => {
    expect(extractEsScoreFromText("総合スコア: 82/100\n構成評価: 8/10")).toBe(82);
  });

  it("normalizes a 10-point total score", () => {
    expect(extractEsScoreFromText("総合評価: 8.5/10")).toBe(85);
  });

  it("falls back to average ten-point metrics", () => {
    expect(extractEsScoreFromText("1) 構成評価（8/10）\n2) 明瞭性（7/10）")).toBe(75);
  });

  it("returns null when no score-like label exists", () => {
    expect(extractEsScoreFromText("改善点を中心に整理しました。")).toBeNull();
  });
});

describe("extractEsScoreFromSavedSummary", () => {
  it("reads the summary field from the saved AI payload", () => {
    expect(extractEsScoreFromSavedSummary(JSON.stringify({ summary: "総合スコア: 91点" }))).toBe(91);
  });
});
