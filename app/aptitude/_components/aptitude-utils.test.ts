import { describe, expect, it } from "vitest";
import { buildPrompt } from "./aptitude-utils";
import { Answers } from "../types";

const fullAnswers: Answers = {
  interests: ["IT", "金融"],
  strengths: ["論理的思考"],
  values: ["成長"],
  enjoy: "コーディング",
  achievements: "個人開発アプリのリリース",
  dislike: "単純作業",
  workStyle: "裁量重視",
  location: "リモート可",
  industryWish: "IT",
  roleWish: "エンジニア",
  mbti: "INTJ",
  otherNotes: "特になし",
};

const emptyAnswers: Answers = {
  interests: [],
  strengths: [],
  values: [],
  enjoy: "",
  achievements: "",
  dislike: "",
  workStyle: "",
  location: "",
  industryWish: "",
  roleWish: "",
  mbti: "",
  otherNotes: "",
};

describe("buildPrompt", () => {
  it("builds the exact expected string for fully filled answers", () => {
    expect(buildPrompt(fullAnswers)).toBe(
      [
        "興味のある領域: IT, 金融",
        "強み: 論理的思考",
        "価値観: 成長",
        "好きな業務/没頭できること: コーディング",
        "誇りに思う達成: 個人開発アプリのリリース",
        "苦手・避けたいこと: 単純作業",
        "働き方の希望: 裁量重視",
        "希望勤務地/働き方: リモート可",
        "興味のある業界: IT",
        "興味のある職種: エンジニア",
        "MBTI: INTJ",
        "補足メモ: 特になし",
      ].join("\n"),
    );
  });

  it("falls back to 未選択 for empty array fields", () => {
    const prompt = buildPrompt(emptyAnswers);
    expect(prompt).toContain("興味のある領域: 未選択");
    expect(prompt).toContain("強み: 未選択");
    expect(prompt).toContain("価値観: 未選択");
  });

  it("falls back to 未記入 for empty string fields", () => {
    const prompt = buildPrompt(emptyAnswers);
    expect(prompt).toContain("好きな業務/没頭できること: 未記入");
    expect(prompt).toContain("MBTI: 未記入");
    expect(prompt).toContain("補足メモ: 未記入");
  });
});
