import { randomUUID } from "crypto";
import { esQuestionsSchema } from "@/lib/validation/schemas/forms";

type Question = { id: string; prompt: string; answer_md: string };

export function parseQuestions(questionsJson: string | null): Question[] {
  if (!questionsJson) return [];
  try {
    const questionsValue = JSON.parse(questionsJson);
    const validated = esQuestionsSchema.parse(questionsValue);
    return validated
      .map((q) => ({
        id: typeof q?.id === "string" ? q.id : randomUUID(),
        prompt: typeof q?.prompt === "string" ? q.prompt : "",
        answer_md: typeof q?.answer_md === "string" ? q.answer_md : "",
      }))
      .filter((q) => q.prompt.trim() || q.answer_md.trim());
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("questions_json must be valid JSON");
    }
    throw error;
  }
}

export function combineContent(questions: Question[], fallback: string) {
  if (!questions.length) return fallback;
  return questions
    .map((q) => {
      const prompt = q.prompt?.trim() ?? "";
      const answer = q.answer_md?.trim() ?? "";
      return [prompt, answer].filter(Boolean).join("\n");
    })
    .filter(Boolean)
    .join("\n\n");
}
