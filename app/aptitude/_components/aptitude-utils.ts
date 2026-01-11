import { Answers } from "../types";

export const buildPrompt = (answers: Answers) =>
  [
    `興味のある領域: ${answers.interests.join(", ") || "未選択"}`,
    `強み: ${answers.strengths.join(", ") || "未選択"}`,
    `価値観: ${answers.values.join(", ") || "未選択"}`,
    `好きな業務/没頭できること: ${answers.enjoy || "未記入"}`,
    `誇りに思う達成: ${answers.achievements || "未記入"}`,
    `苦手・避けたいこと: ${answers.dislike || "未記入"}`,
    `働き方の希望: ${answers.workStyle || "未記入"}`,
    `希望勤務地/働き方: ${answers.location || "未記入"}`,
    `興味のある業界: ${answers.industryWish || "未記入"}`,
    `興味のある職種: ${answers.roleWish || "未記入"}`,
    `MBTI: ${answers.mbti || "未記入"}`,
    `補足メモ: ${answers.otherNotes || "未記入"}`,
  ].join("\n");
