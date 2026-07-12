import { afterEach, describe, expect, it, vi } from "vitest";

const ENV_KEYS = ["AI_PROVIDER_API_KEY", "AI_PROVIDER", "AI_API_VERSION", "AI_ENDPOINT", "AI_MODEL"] as const;

const originalEnv: Record<string, string | undefined> = {};
for (const key of ENV_KEYS) originalEnv[key] = process.env[key];

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
  vi.resetModules();
});

async function loadConfig() {
  vi.resetModules();
  return import("./config");
}

describe("AI_PROVIDER resolution", () => {
  it('defaults to "gemini" when unset', async () => {
    delete process.env.AI_PROVIDER;
    const { AI_PROVIDER } = await loadConfig();
    expect(AI_PROVIDER).toBe("gemini");
  });

  it('normalizes "openai" to "gpt"', async () => {
    process.env.AI_PROVIDER = "openai";
    const { AI_PROVIDER } = await loadConfig();
    expect(AI_PROVIDER).toBe("gpt");
  });

  it('keeps "gpt" as "gpt"', async () => {
    process.env.AI_PROVIDER = "gpt";
    const { AI_PROVIDER } = await loadConfig();
    expect(AI_PROVIDER).toBe("gpt");
  });

  it("falls back to gemini for an unknown value", async () => {
    process.env.AI_PROVIDER = "foo";
    const { AI_PROVIDER } = await loadConfig();
    expect(AI_PROVIDER).toBe("gemini");
  });
});

describe("AI_API_VERSION / GPT_ENDPOINT", () => {
  it("uses defaults when unset", async () => {
    delete process.env.AI_API_VERSION;
    delete process.env.AI_ENDPOINT;
    const { AI_API_VERSION, GPT_ENDPOINT } = await loadConfig();
    expect(AI_API_VERSION).toBe("v1beta");
    expect(GPT_ENDPOINT).toBe("https://api.openai.com/v1/chat/completions");
  });

  it("respects overrides", async () => {
    process.env.AI_API_VERSION = "v1";
    process.env.AI_ENDPOINT = "https://example.com/custom";
    const { AI_API_VERSION, GPT_ENDPOINT } = await loadConfig();
    expect(AI_API_VERSION).toBe("v1");
    expect(GPT_ENDPOINT).toBe("https://example.com/custom");
  });
});

describe("resolvedModel", () => {
  it("returns provider-specific defaults when AI_MODEL is unset", async () => {
    delete process.env.AI_MODEL;
    const { resolvedModel } = await loadConfig();
    expect(resolvedModel("gemini")).toBe("gemini-1.5-flash-latest");
    expect(resolvedModel("gpt")).toBe("gpt-4o-mini");
  });

  it("uses AI_MODEL for any provider when set", async () => {
    process.env.AI_MODEL = "custom-model";
    const { resolvedModel } = await loadConfig();
    expect(resolvedModel("gemini")).toBe("custom-model");
    expect(resolvedModel("gpt")).toBe("custom-model");
  });
});

describe("geminiEndpoint", () => {
  it("builds the URL with api version, model, and key", async () => {
    process.env.AI_API_VERSION = "v1beta";
    process.env.AI_PROVIDER_API_KEY = "test-key";
    const { geminiEndpoint } = await loadConfig();
    expect(geminiEndpoint("gemini-1.5-flash-latest")).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=test-key",
    );
  });
});
