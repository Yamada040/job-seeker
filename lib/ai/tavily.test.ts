import { afterEach, describe, expect, it, vi } from "vitest";

const originalKey = process.env.TAVILY_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.TAVILY_API_KEY;
  else process.env.TAVILY_API_KEY = originalKey;
  vi.unstubAllGlobals();
  vi.resetModules();
});

async function loadTavily() {
  vi.resetModules();
  return import("./tavily");
}

describe("tavilySearch", () => {
  it("returns empty results without calling fetch when the API key is unset", async () => {
    delete process.env.TAVILY_API_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { tavilySearch } = await loadTavily();
    const result = await tavilySearch("就職活動");

    expect(result).toEqual({ query: "就職活動", results: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps results from a successful response", async () => {
    process.env.TAVILY_API_KEY = "tavily-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        query: "就職活動",
        results: [{ title: "t", url: "https://example.com", content: "c", score: 0.9 }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { tavilySearch } = await loadTavily();
    const result = await tavilySearch("就職活動", 3);

    expect(result).toEqual({
      query: "就職活動",
      results: [{ title: "t", url: "https://example.com", content: "c", score: 0.9 }],
    });
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body).max_results).toBe(3);
  });

  it("throws on a non-ok response", async () => {
    process.env.TAVILY_API_KEY = "tavily-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, text: async () => "unavailable" }));

    const { tavilySearch } = await loadTavily();

    await expect(tavilySearch("就職活動")).rejects.toThrow(/Tavily search failed \(503\)/);
  });
});
