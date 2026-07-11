import { AiResponse } from "./types";
import { tavilySearch } from "./tavily";
import { AI_KEY, AI_PROVIDER, GPT_ENDPOINT, geminiEndpoint, resolvedModel } from "./config";

const MAX_SEARCH_ITERATIONS = 3;

const SYSTEM_PROMPT = `あなたは日本の人事担当です。候補者向けに会社を説明し、求める人物像を端的に伝えます。日本語で回答してください。
search_webツールを使って最新の採用情報・企業情報を収集してから分析してください。
会社名が不明・存在しない場合は「情報不足」と明記し、推測で書かないでください。

出力フォーマット（箇条書き中心・推測なし）
1) 概要・事業
2) 強み / 弱み
3) 文化・働き方
4) 人事が伝えたいポイント（3-5個）
5) 求める人物像（3-5個）`;

const SEARCH_TOOL_DEFINITION = {
  name: "search_web",
  description: "Webを検索して企業の最新情報（採用情報・ニュース・口コミ・社風など）を取得する",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "検索クエリ（例: 'ソフトバンク 採用情報 2025'）",
      },
    },
    required: ["query"],
  },
};

export type AgenticProgressCallback = (message: string) => void;

function extractBulletPoints(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || line.startsWith("・"))
    .map((line) => line.replace(/^[-・]\s?/, ""));
}

function formatSearchResults(results: Awaited<ReturnType<typeof tavilySearch>>["results"]): string {
  if (!results.length) return "検索結果が見つかりませんでした。";
  return results.map((r) => `【${r.title}】\n${r.content}\nURL: ${r.url}`).join("\n\n");
}

// ---- Gemini ----------------------------------------------------------------

type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, string> } }
  | { functionResponse: { name: string; response: Record<string, string> } };

type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

type GeminiRawResponse = {
  candidates?: {
    content?: {
      parts?: Array<
        { text?: string } | { functionCall?: { name: string; args: Record<string, string> } }
      >;
    };
  }[];
};

async function callGeminiWithTools(contents: GeminiContent[]): Promise<{
  text?: string;
  functionCall?: { name: string; args: Record<string, string> };
}> {
  const model = resolvedModel("gemini");
  const endpoint = geminiEndpoint(model);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      tools: [{ functionDeclarations: [SEARCH_TOOL_DEFINITION] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`Gemini API error (${res.status}):`, body);
    throw new Error("企業情報の取得中にエラーが発生しました。しばらく経ってから再試行してください。");
  }

  const data = (await res.json()) as GeminiRawResponse;
  const parts = data?.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    if ("functionCall" in part && part.functionCall) {
      return { functionCall: part.functionCall };
    }
    if ("text" in part && part.text) {
      return { text: part.text };
    }
  }
  return { text: "Geminiから回答を取得できませんでした。" };
}

async function runGeminiAgenticLoop(
  input: string,
  onProgress: AgenticProgressCallback
): Promise<AiResponse> {
  const contents: GeminiContent[] = [
    { role: "user", parts: [{ text: `以下の情報をもとに企業分析を行ってください:\n\n${input}` }] },
  ];

  let searchCount = 0;

  while (searchCount < MAX_SEARCH_ITERATIONS) {
    const result = await callGeminiWithTools(contents);

    if (result.text) {
      const bulletPoints = extractBulletPoints(result.text);
      return { summary: result.text, bulletPoints: bulletPoints.length ? bulletPoints : undefined, provider: "gemini" };
    }

    if (result.functionCall?.name === "search_web") {
      const query = result.functionCall.args.query ?? "";
      onProgress(`「${query}」を検索中...`);

      contents.push({ role: "model", parts: [{ functionCall: result.functionCall }] });

      const searchOutput = await tavilySearch(query);
      contents.push({
        role: "user",
        parts: [{ functionResponse: { name: "search_web", response: { result: formatSearchResults(searchOutput.results) } } }],
      });

      searchCount++;
    } else {
      break;
    }
  }

  // 上限に達した場合は最終回答を明示的に要求
  contents.push({ role: "user", parts: [{ text: "収集した情報をもとに、最終的な企業分析を出力してください。" }] });
  const finalResult = await callGeminiWithTools(contents);
  const text = finalResult.text ?? "企業分析を完了できませんでした。";
  const bulletPoints = extractBulletPoints(text);
  return { summary: text, bulletPoints: bulletPoints.length ? bulletPoints : undefined, provider: "gemini" };
}

// ---- GPT -------------------------------------------------------------------

type GptToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type GptMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: GptToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

type GptRawResponse = {
  choices?: {
    message?: { content?: string | null; tool_calls?: GptToolCall[] };
    finish_reason?: string;
  }[];
};

async function callGptWithTools(messages: GptMessage[]): Promise<{
  text?: string;
  toolCalls?: GptToolCall[];
}> {
  const model = resolvedModel("gpt");
  const endpoint = GPT_ENDPOINT;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      tools: [{ type: "function", function: SEARCH_TOOL_DEFINITION }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`GPT API error (${res.status}):`, body);
    throw new Error("企業情報の取得中にエラーが発生しました。しばらく経ってから再試行してください。");
  }

  const data = (await res.json()) as GptRawResponse;
  const message = data?.choices?.[0]?.message;

  if (message?.tool_calls?.length) return { toolCalls: message.tool_calls };
  return { text: message?.content ?? "GPTから回答を取得できませんでした。" };
}

async function runGptAgenticLoop(
  input: string,
  onProgress: AgenticProgressCallback
): Promise<AiResponse> {
  const messages: GptMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `以下の情報をもとに企業分析を行ってください:\n\n${input}` },
  ];

  let searchCount = 0;

  while (searchCount < MAX_SEARCH_ITERATIONS) {
    const result = await callGptWithTools(messages);

    if (result.text) {
      const bulletPoints = extractBulletPoints(result.text);
      return { summary: result.text, bulletPoints: bulletPoints.length ? bulletPoints : undefined, provider: "gpt" };
    }

    if (result.toolCalls?.length) {
      messages.push({ role: "assistant", content: null, tool_calls: result.toolCalls });

      for (const toolCall of result.toolCalls) {
        if (toolCall.function.name === "search_web") {
          const args = JSON.parse(toolCall.function.arguments) as { query: string };
          onProgress(`「${args.query}」を検索中...`);

          const searchOutput = await tavilySearch(args.query);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: formatSearchResults(searchOutput.results),
          });
        }
      }

      searchCount++;
    } else {
      break;
    }
  }

  messages.push({ role: "user", content: "収集した情報をもとに、最終的な企業分析を出力してください。" });
  const finalResult = await callGptWithTools(messages);
  const text = finalResult.text ?? "企業分析を完了できませんでした。";
  const bulletPoints = extractBulletPoints(text);
  return { summary: text, bulletPoints: bulletPoints.length ? bulletPoints : undefined, provider: "gpt" };
}

// ---- Public API ------------------------------------------------------------

export async function agenticCompanyAnalysis(
  input: string,
  onProgress: AgenticProgressCallback
): Promise<AiResponse> {
  if (!AI_KEY) {
    return {
      summary: "AI_PROVIDER_API_KEY を .env.local に設定してください。",
      bulletPoints: ["AI_PROVIDER_API_KEY を設定する"],
    };
  }

  onProgress("企業情報を収集中...");

  if (AI_PROVIDER === "gpt") return runGptAgenticLoop(input, onProgress);
  return runGeminiAgenticLoop(input, onProgress);
}
