export type AiProvider = "gemini" | "gpt";

export type AiPromptKind = "es_review" | "company_analysis";

export interface AiResponse {
  summary: string;
  bulletPoints?: string[];
  raw?: unknown;
}

export interface AiClient {
  provider: AiProvider;
  call(prompt: string, kind: AiPromptKind): Promise<AiResponse>;
}
