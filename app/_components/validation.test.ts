import { describe, expect, it } from "vitest";
import { MAX_TEXT_LEN, required, tooLong } from "./validation";

describe("tooLong", () => {
  it("uses the default max length in the message", () => {
    expect(tooLong("タイトル")).toBe(`タイトルは${MAX_TEXT_LEN}文字以内で入力してください`);
  });

  it("uses an explicit max length when provided", () => {
    expect(tooLong("タイトル", 50)).toBe("タイトルは50文字以内で入力してください");
  });
});

describe("required", () => {
  it("embeds the label in the message", () => {
    expect(required("タイトル")).toBe("タイトルは必須です");
  });
});
