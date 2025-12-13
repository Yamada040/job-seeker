import { AiClient, AiProvider, AiPromptKind, AiResponse } from "./types";

const AI_PROVIDER = (process.env.AI_PROVIDER ?? "gemini") as AiProvider;
const AI_KEY = process.env.AI_PROVIDER_API_KEY;
const AI_MODEL = process.env.AI_MODEL;
const AI_API_VERSION = process.env.AI_API_VERSION || "v1beta";

const templates: Record<AiPromptKind, (input: string) => string> = {
  es_review: (input) =>
    [
      "あなたは日本の人事/面接官です。ATSを意識し、読みやすく評価しやすい回答に整えます。必ず日本語で回答してください。",
      "会社名・選考ステータス・URLなどが含まれていれば踏まえてください。情報が不足している場合は推測せず「情報不足」と明記します。",
      "出力フォーマット",
      "1) 構成評価（10点満点、短いコメント）",
      "2) 明瞭性（10点満点、短いコメント）",
      "3) 改善点（100〜200字で要約）",
      "4) 修正版ドラフト（面接官に刺さる表現でリライト）",
      "",
      "入力ES:",
      input,
    ].join("\n"),
  company_analysis: (input) =>
    [
      "あなたは日本の人事担当です。候補者向けに会社を説明し、求める人物像を端的に伝えます。日本語で回答してください。",
      "会社名が不明・存在しない場合は「情報不足」と明記し、推測で書かないでください。URL があれば参照します。",
      "出力フォーマット（箇条書き中心・推測なし）",
      "1) 概要・事業",
      "2) 強み / 弱み",
      "3) 文化・働き方",
      "4) 人事が伝えたいポイント（3-5個）",
      "5) 求める人物像（3-5個）",
      "",
      "入力情報:",
      input,
    ].join("\n"),
  aptitude_analysis: (input) =>
    [
      "あなたは日本のキャリアアドバイザー兼リクルーターです。回答から、向いている/避けたほうがよい業界・職種をできるだけ細かい粒度で診断してください。日本語で回答します。",
      "推測で書かず、情報不足のときは「情報不足」と明記してください。",
      "出力フォーマット（簡潔な箇条書き中心）",
      "1) 業界トップ3（できるだけ細かい粒度で例示）",
      "2) 職種トップ3（できるだけ細かい粒度で例示）",
      "3) 強みが活きるポイント（3-5行）",
      "4) リスク・ミスマッチ/注意点（3-5行）",
      "5) 次の一歩（企業リサーチ、スキル強化、ES・面接で押す軸を3-5行）",
      "",
      "質問回答:",
      input,
    ].join("\n"),
  self_analysis: (input) =>
    [
      "あなたは日本のキャリアコーチです。回答から本人の強み・価値観・モチベーション源泉を整理し、自己PR素材に落とし込んでください。日本語で回答します。",
      "出力フォーマット（簡潔な箇条書き中心）",
      "1) 強み3-5個（エピソードを一言で添える）",
      "2) 価値観/仕事観3-5個",
      "3) モチベーション源泉・ハマりやすい環境（3-5行）",
      "4) 自己PRの骨子（200-300字で下書き）",
      "5) 今後深掘りすべき問い（3-5個）",
      "",
      "質問回答:",
      input,
    ].join("\n"),
  interview_review: (input) =>
    [
      "あなたは日本の面接官兼キャリアコーチです。面接の振り返り内容から改善点を抽出し、次回に活かす具体アクションを示してください。日本語で回答します。",
      "推測で書かず、情報が無い場合は「情報不足」と明記してください。",
      "出力フォーマット（簡潔な箇条書き中心）",
      "1) 良かった点（3-5行）",
      "2) 改善すべき点（3-5行）",
      "3) 次回に向けた具体アクション（3-5行）",
      "4) 想定される追質問と準備メモ（3-5行）",
      "",
      "面接ログ:",
      input,
    ].join("\n"),
};

function missingKeyResponse(): AiResponse {
  return {
    summary: "AI_PROVIDER_API_KEY を .env.local に設定してください。",
    bulletPoints: ["AI_PROVIDER_API_KEY を設定する", "AI_PROVIDER は gemini か gpt を指定する"],
  };
}

async function callGemini(prompt: string): Promise<AiResponse> {
  if (!AI_KEY) return missingKeyResponse();
  const model = AI_MODEL || "gemini-1.5-flash-latest";
  const endpoint = `https://generativelanguage.googleapis.com/${AI_API_VERSION}/models/${model}:generateContent?key=${AI_KEY}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    return {
      summary: `Gemini呼び出しに失敗しました (${res.status})`,
      bulletPoints: bodyText ? [bodyText] : undefined,
    };
  }

  type GeminiPart = { text?: string };
  type GeminiContent = { parts?: GeminiPart[] };
  type GeminiResponse = { candidates?: { content?: GeminiContent }[] };
  const data = (await res.json()) as GeminiResponse;
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text: string | undefined = parts.map((p) => p.text ?? "").filter(Boolean).join("\n") || undefined;

  if (!text) {
    return { summary: "Geminiからテキストが取得できませんでした。" };
  }

  const bulletPoints = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || line.startsWith("・"))
    .map((line) => line.replace(/^[-・]\s?/, ""));

  return { summary: text, bulletPoints: bulletPoints.length ? bulletPoints : undefined, provider: "gemini" };
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
    const bodyText = await res.text().catch(() => "");
    return { summary: `GPT呼び出しに失敗しました (${res.status})`, bulletPoints: bodyText ? [bodyText] : undefined };
  }

  type OpenAIChoice = { message?: { content?: string } };
  type OpenAIResponse = { choices?: OpenAIChoice[] };
  const data = (await res.json()) as OpenAIResponse;
  const text: string | undefined = data?.choices?.[0]?.message?.content;

  if (!text) {
    return { summary: "GPTからテキストが取得できませんでした。" };
  }

  const bulletPoints = text
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.startsWith("-") || line.startsWith("・"))
    .map((line: string) => line.replace(/^[-・]\s?/, ""));

  return { summary: text, bulletPoints: bulletPoints.length ? bulletPoints : undefined, provider: "gpt" };
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
