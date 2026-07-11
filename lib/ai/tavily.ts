const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_ENDPOINT = "https://api.tavily.com/search";

export type TavilySearchResult = {
  title: string;
  url: string;
  content: string;
  score: number;
};

export type TavilyOutput = {
  query: string;
  results: TavilySearchResult[];
};

export async function tavilySearch(query: string, maxResults = 5): Promise<TavilyOutput> {
  if (!TAVILY_API_KEY) {
    return { query, results: [] };
  }

  const res = await fetch(TAVILY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      max_results: maxResults,
      include_answer: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Tavily search failed (${res.status}): ${body}`);
  }

  type RawResult = { title: string; url: string; content: string; score: number };
  type RawResponse = { query: string; results: RawResult[] };

  const data = (await res.json()) as RawResponse;

  return {
    query: data.query,
    results: (data.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
    })),
  };
}
