// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  XP_STATUS_COOKIE,
  XP_UPDATED_EVENT,
  consumeXpStatusCookie,
  encodeXpStatus,
  notifyXpUpdated,
} from "./level-up-signal";

function setStatusCookie(rawValue: string) {
  document.cookie = `${XP_STATUS_COOKIE}=${rawValue}; path=/`;
}

afterEach(() => {
  // clear all cookies between tests
  document.cookie.split("; ").forEach((row) => {
    const name = row.split("=")[0];
    if (name) document.cookie = `${name}=; path=/; max-age=0`;
  });
});

describe("encodeXpStatus", () => {
  it("URI-encodes the JSON-serialized status", () => {
    const status = { xp: 100, level: 5, leveledUp: 5 };
    expect(encodeXpStatus(status)).toBe(encodeURIComponent(JSON.stringify(status)));
  });
});

describe("consumeXpStatusCookie", () => {
  it("returns null when the cookie is absent", () => {
    expect(consumeXpStatusCookie()).toBeNull();
  });

  it("returns the parsed status and removes the cookie", () => {
    setStatusCookie(encodeXpStatus({ xp: 30, level: 2, leveledUp: 2 }));

    const result = consumeXpStatusCookie();

    expect(result).toEqual({ xp: 30, level: 2, leveledUp: 2 });
    expect(document.cookie).not.toContain(XP_STATUS_COOKIE);
  });

  it("returns null and still clears the cookie when the value is malformed JSON", () => {
    setStatusCookie("not-json");

    const result = consumeXpStatusCookie();

    expect(result).toBeNull();
    expect(document.cookie).not.toContain(XP_STATUS_COOKIE);
  });

  it("returns null when xp/level are not numbers", () => {
    setStatusCookie(encodeURIComponent(JSON.stringify({ xp: "30", level: 2 })));

    expect(consumeXpStatusCookie()).toBeNull();
  });

  it("defaults leveledUp to null when missing", () => {
    setStatusCookie(encodeURIComponent(JSON.stringify({ xp: 30, level: 2 })));

    expect(consumeXpStatusCookie()).toEqual({ xp: 30, level: 2, leveledUp: null });
  });
});

describe("notifyXpUpdated", () => {
  it("dispatches the XP_UPDATED_EVENT on window", () => {
    const listener = vi.fn();
    window.addEventListener(XP_UPDATED_EVENT, listener);

    notifyXpUpdated();

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(XP_UPDATED_EVENT, listener);
  });
});
