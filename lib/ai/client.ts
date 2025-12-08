import { AiClient, AiProvider, AiPromptKind, AiResponse } from "./types";

const AI_PROVIDER = (process.env.AI_PROVIDER ?? "gemini") as AiProvider;
const AI_KEY = process.env.AI_PROVIDER_API_KEY;
const AI_MODEL = process.env.AI_MODEL; // 任意でモデルを上書き

// プロンプトテンプレート（ASCIIで安全に）
const templates: Record<AiPromptKind, (input: string) => string> = {
  es_review: (input) =>
    [
      "あなたは日本の新卒採用を担当する人事・面接官およびATS対策の専門家です。",
      "以下のESを「構成・明瞭性・インパクト」の3観点で評価し、すべて日本語で回答してください。",
      "出力フォーマット:",
      "1) 評価: 3〜5行で、現状の良い点と弱い点をATS視点でまとめる",
      "2) 改善点: 箇条書きで3〜5個、具体的な修正指示（数字・行動・成果を含める）",
      "3) 書き直し案: 100点を目指す日本語ドラフト（400〜600字目安）。事実と合わない仮定は追加しない。",
      "",
      "対象のES:",
      input,
    ].join("\n"),
  company_analysis: (input) =>
    [
      "You are an analyst creating a concise company brief for job hunters.",
      "Summarize: overview, main businesses, strengths, weaknesses, culture, and a 50-word JP-ready pitch.",
      "Input can include name/URL/free text. Output should be in Japanese.",
      "",
      "Source:",
      input,
    ].join("\n"),
};

function missingKeyResponse(): AiResponse {
  return {
    summary: "AI_PROVIDER_API_KEY が未設定です。.env.local に追加してください。",
    bulletPoints: ["AI_PROVIDER_API_KEY を設定", "AI_PROVIDER は gemini または gpt"],
  };
}

async function callGemini(prompt: string): Promise<AiResponse> {
  if (!AI_KEY) return missingKeyResponse();
  // AI Studioで ListModels に載る正式名称を使う
  const model = AI_MODEL;
  // v1beta の方が広く通るためデフォルトは v1beta
  const apiVersion = process.env.AI_API_VERSION || "v1beta";
  const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${AI_KEY}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    return { summary: `Gemini呼び出しに失敗しました (${res.status})`, bulletPoints: bodyText ? [bodyText] : undefined };
  }

  type GeminiPart = { text?: string };
  type GeminiContent = { parts?: GeminiPart[] };
  type GeminiResponse = { candidates?: { content?: GeminiContent }[] };
  const data = (await res.json()) as GeminiResponse;
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text: string | undefined =
    parts.map((p) => p.text ?? "").filter(Boolean).join("\n") || undefined;

  if (!text) {
    return { summary: "Geminiからテキストを取得できませんでした。" };
  }

  const bulletPoints = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || line.startsWith("・"))
    .map((line) => line.replace(/^[-・]\s?/, ""));

  return { summary: text, bulletPoints: bulletPoints.length ? bulletPoints : undefined };
}

async function callGpt(prompt: string): Promise<AiResponse> {
  if (!AI_KEY) return missingKeyResponse();
  const model = AI_MODEL || "gpt-4o-mini";
  const endpoint = process.env.AI_ENDPOINT || "https://api.openai.com/v1/chat/completions";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are an assistant for Japanese job hunting. Reply in Japanese." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    return { summary: `GPT呼び出しに失敗しました (${res.status})` };
  }

  type OpenAIChoice = { message?: { content?: string } };
  type OpenAIResponse = { choices?: OpenAIChoice[] };
  const data = (await res.json()) as OpenAIResponse;
  const text: string | undefined = data?.choices?.[0]?.message?.content;

  if (!text) {
    return { summary: "GPTからテキストを取得できませんでした。" };
  }

  const bulletPoints = text
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.startsWith("-") || line.startsWith("・"))
    .map((line: string) => line.replace(/^[-・]\s?/, ""));

  return { summary: text, bulletPoints: bulletPoints.length ? bulletPoints : undefined };
}

export function createAiClient(): AiClient {
  const provider: AiProvider = AI_PROVIDER === "gpt" ? "gpt" : "gemini";
  return {
    provider,
    async call(input: string, kind: AiPromptKind) {
      const prompt = templates[kind](input);
      if (provider === "gpt") {
        return callGpt(prompt);
      }
      return callGemini(prompt);
    },
  };
}
