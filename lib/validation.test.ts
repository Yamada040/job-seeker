import { describe, expect, it } from "vitest";
import {
  checkboxBoolean,
  optionalNonNegativeNumber,
  optionalNumber,
  optionalString,
  optionalTrimmedString,
  requiredTrimmedString,
} from "./validation";

describe("requiredTrimmedString", () => {
  it("trims surrounding whitespace", () => {
    expect(requiredTrimmedString.parse("  hello  ")).toBe("hello");
  });

  it("rejects a whitespace-only string after trimming", () => {
    expect(() => requiredTrimmedString.parse("   ")).toThrow();
  });

  it("rejects non-string input", () => {
    expect(() => requiredTrimmedString.parse(5)).toThrow();
  });
});

describe("optionalTrimmedString", () => {
  it("converts null/undefined to undefined", () => {
    expect(optionalTrimmedString.parse(null)).toBeUndefined();
    expect(optionalTrimmedString.parse(undefined)).toBeUndefined();
  });

  it("converts an empty or whitespace-only string to undefined after trimming", () => {
    expect(optionalTrimmedString.parse("")).toBeUndefined();
    expect(optionalTrimmedString.parse("   ")).toBeUndefined();
  });

  it("trims and keeps a normal string", () => {
    expect(optionalTrimmedString.parse("  abc  ")).toBe("abc");
  });
});

describe("optionalString", () => {
  it("converts null/undefined to undefined", () => {
    expect(optionalString.parse(null)).toBeUndefined();
    expect(optionalString.parse(undefined)).toBeUndefined();
  });

  it("keeps an empty string as-is (unlike optionalTrimmedString)", () => {
    expect(optionalString.parse("")).toBe("");
  });
});

describe("optionalNumber", () => {
  it("converts empty string/null/undefined to undefined", () => {
    expect(optionalNumber.parse("")).toBeUndefined();
    expect(optionalNumber.parse(null)).toBeUndefined();
    expect(optionalNumber.parse(undefined)).toBeUndefined();
  });

  it("passes through a number as-is", () => {
    expect(optionalNumber.parse(42)).toBe(42);
  });

  it("coerces a numeric string", () => {
    expect(optionalNumber.parse("42")).toBe(42);
  });

  it("rejects a non-numeric string (NaN fails .finite())", () => {
    expect(() => optionalNumber.parse("abc")).toThrow();
  });
});

describe("optionalNonNegativeNumber", () => {
  it("behaves like optionalNumber for valid non-negative values", () => {
    expect(optionalNonNegativeNumber.parse("")).toBeUndefined();
    expect(optionalNonNegativeNumber.parse("10")).toBe(10);
  });

  it("rejects negative numbers", () => {
    expect(() => optionalNonNegativeNumber.parse("-5")).toThrow();
    expect(() => optionalNonNegativeNumber.parse(-1)).toThrow();
  });
});

describe("checkboxBoolean", () => {
  it('treats "on" as true', () => {
    expect(checkboxBoolean.parse("on")).toBe(true);
  });

  it("treats any other value as false", () => {
    expect(checkboxBoolean.parse("off")).toBe(false);
    expect(checkboxBoolean.parse("")).toBe(false);
    expect(checkboxBoolean.parse(undefined)).toBe(false);
  });
});
