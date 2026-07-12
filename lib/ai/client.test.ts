import { afterEach, describe, expect, it, vi } from "vitest";

const ENV_KEYS = ["AI_PROVIDER_API_KEY", "AI_PROVIDER"] as const;
const originalEnv: Record<string, string | undefined> = {};
for (const key of ENV_KEYS) originalEnv[key] = process.env[key];

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
  vi.unstubAllGlobals();
  vi.resetModules();
});

async function loadClient() {
  vi.resetModules();
  return import("./client");
}

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("createAiClient - missing API key", () => {
  it("returns the missing-key response without calling fetch (gemini)", async () => {
    delete process.env.AI_PROVIDER_API_KEY;
    process.env.AI_PROVIDER = "gemini";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { createAiClient } = await loadClient();
    const result = await createAiClient().call("入力ES", "es_review");

    expect(result.summary).toBe("AI_PROVIDER_API_KEY を .env.local に設定してください。");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the missing-key response without calling fetch (gpt)", async () => {
    delete process.env.AI_PROVIDER_API_KEY;
    process.env.AI_PROVIDER = "gpt";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { createAiClient } = await loadClient();
    const result = await createAiClient().call("入力ES", "es_review");

    expect(result.summary).toBe("AI_PROVIDER_API_KEY を .env.local に設定してください。");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("createAiClient - gemini", () => {
  it("joins parts, extracts bullet points, and tags the provider on success", async () => {
    process.env.AI_PROVIDER_API_KEY = "test-key";
    process.env.AI_PROVIDER = "gemini";
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        candidates: [{ content: { parts: [{ text: "- item1\n通常文\n・item2" }] } }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { createAiClient } = await loadClient();
    const result = await createAiClient().call("自己PRです", "es_review");

    expect(result.summary).toBe("- item1\n通常文\n・item2");
    expect(result.bulletPoints).toEqual(["item1", "item2"]);
    expect(result.provider).toBe("gemini");

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("https://generativelanguage.googleapis.com");
    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(requestBody.contents[0].parts[0].text).toContain("自己PRです");
  });

  it("returns a generic error summary on a non-ok response without throwing", async () => {
    process.env.AI_PROVIDER_API_KEY = "test-key";
    process.env.AI_PROVIDER = "gemini";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, false, 500)));

    const { createAiClient } = await loadClient();
    const result = await createAiClient().call("入力", "es_review");

    expect(result.summary).toBe("AI分析中にエラーが発生しました。しばらく経ってから再試行してください。");
  });

  it("returns a no-text message when candidates are empty", async () => {
    process.env.AI_PROVIDER_API_KEY = "test-key";
    process.env.AI_PROVIDER = "gemini";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ candidates: [] })));

    const { createAiClient } = await loadClient();
    const result = await createAiClient().call("入力", "es_review");

    expect(result.summary).toBe("Geminiからテキストが取得できませんでした。");
  });
});

describe("createAiClient - gpt", () => {
  it("joins content, extracts bullet points, and tags the provider on success", async () => {
    process.env.AI_PROVIDER_API_KEY = "test-key";
    process.env.AI_PROVIDER = "gpt";
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ choices: [{ message: { content: "- a\nb\n・c" } }] }));
    vi.stubGlobal("fetch", fetchMock);

    const { createAiClient } = await loadClient();
    const result = await createAiClient().call("面接ログ", "interview_review");

    expect(result.summary).toBe("- a\nb\n・c");
    expect(result.bulletPoints).toEqual(["a", "c"]);
    expect(result.provider).toBe("gpt");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(init.headers.Authorization).toBe("Bearer test-key");
  });

  it("returns a generic error summary on a non-ok response without throwing", async () => {
    process.env.AI_PROVIDER_API_KEY = "test-key";
    process.env.AI_PROVIDER = "gpt";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, false, 429)));

    const { createAiClient } = await loadClient();
    const result = await createAiClient().call("入力", "es_review");

    expect(result.summary).toBe("AI分析中にエラーが発生しました。しばらく経ってから再試行してください。");
  });
});

describe("createAiClient - provider switching", () => {
  it("routes to the OpenAI endpoint when AI_PROVIDER=gpt", async () => {
    process.env.AI_PROVIDER_API_KEY = "test-key";
    process.env.AI_PROVIDER = "gpt";
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ choices: [{ message: { content: "ok" } }] }));
    vi.stubGlobal("fetch", fetchMock);

    const { createAiClient } = await loadClient();
    await createAiClient().call("入力", "es_review");

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.openai.com/v1/chat/completions");
  });

  it("routes to the Gemini endpoint for any non-gpt provider", async () => {
    process.env.AI_PROVIDER_API_KEY = "test-key";
    process.env.AI_PROVIDER = "gemini";
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ candidates: [{ content: { parts: [{ text: "ok" }] } }] }));
    vi.stubGlobal("fetch", fetchMock);

    const { createAiClient } = await loadClient();
    await createAiClient().call("入力", "es_review");

    expect(fetchMock.mock.calls[0][0]).toContain("https://generativelanguage.googleapis.com");
  });
});
