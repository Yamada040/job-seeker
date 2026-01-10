import { AiResponse } from "./types";

export const sanitizeMarkdown = (text: string): string =>
  text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*・]\s?/gm, "・")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .trim();

export function buildCopyText(response: AiResponse) {
  const summary = response.summary ? sanitizeMarkdown(response.summary) : "";
  const bullets =
    response.bulletPoints?.length && response.bulletPoints.map((b) => `・${sanitizeMarkdown(b)}`).join("\n");
  return [summary, bullets].filter(Boolean).join("\n\n");
}
