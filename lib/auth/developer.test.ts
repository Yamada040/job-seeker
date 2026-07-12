import { afterEach, describe, expect, it } from "vitest";
import { isDeveloperUserId } from "./developer";

const originalValue = process.env.DEV_ADMIN_USER_IDS;

afterEach(() => {
  if (originalValue === undefined) delete process.env.DEV_ADMIN_USER_IDS;
  else process.env.DEV_ADMIN_USER_IDS = originalValue;
});

describe("isDeveloperUserId", () => {
  it("returns false for null/undefined/empty userId", () => {
    expect(isDeveloperUserId(null)).toBe(false);
    expect(isDeveloperUserId(undefined)).toBe(false);
    expect(isDeveloperUserId("")).toBe(false);
  });

  it("returns false for any id when DEV_ADMIN_USER_IDS is unset", () => {
    delete process.env.DEV_ADMIN_USER_IDS;
    expect(isDeveloperUserId("user-1")).toBe(false);
  });

  it("trims whitespace around comma-separated ids", () => {
    process.env.DEV_ADMIN_USER_IDS = "id1, id2 ,id3";
    expect(isDeveloperUserId("id2")).toBe(true);
    expect(isDeveloperUserId("id1")).toBe(true);
    expect(isDeveloperUserId("id3")).toBe(true);
  });

  it("ignores blank entries from consecutive commas", () => {
    process.env.DEV_ADMIN_USER_IDS = "id1,,id2";
    expect(isDeveloperUserId("id1")).toBe(true);
    expect(isDeveloperUserId("id2")).toBe(true);
    expect(isDeveloperUserId("")).toBe(false);
  });

  it("returns false for an id not in the list", () => {
    process.env.DEV_ADMIN_USER_IDS = "id1,id2";
    expect(isDeveloperUserId("id3")).toBe(false);
  });
});
