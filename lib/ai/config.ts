export const AI_KEY = process.env.AI_PROVIDER_API_KEY;

// "openai" は "gpt" の別名として扱う（README と env 仕様を統一）
const rawProvider = process.env.AI_PROVIDER ?? "gemini";
export const AI_PROVIDER: "gemini" | "gpt" =
  rawProvider === "openai" || rawProvider === "gpt" ? "gpt" : "gemini";
export const AI_API_VERSION = process.env.AI_API_VERSION ?? "v1beta";
export const GPT_ENDPOINT =
  process.env.AI_ENDPOINT ?? "https://api.openai.com/v1/chat/completions";

export function resolvedModel(provider: "gemini" | "gpt"): string {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  return provider === "gpt" ? "gpt-4o-mini" : "gemini-1.5-flash-latest";
}

export function geminiEndpoint(model: string): string {
  return `https://generativelanguage.googleapis.com/${AI_API_VERSION}/models/${model}:generateContent?key=${AI_KEY}`;
}
