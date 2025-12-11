export type AiProvider = "gemini" | "gpt";

export type AiPromptKind = "es_review" | "company_analysis" | "aptitude_analysis" | "self_analysis";

export interface AiResponse {
  summary: string;
  bulletPoints?: string[];
  raw?: unknown;
  provider?: string;
}

export interface AiClient {
  provider: AiProvider;
  call(prompt: string, kind: AiPromptKind): Promise<AiResponse>;
}
