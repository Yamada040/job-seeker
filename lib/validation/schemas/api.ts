import { z } from "zod";

export const ANSWERS_MAX_KEYS = 50;
export const ANSWER_VALUE_MAX_LENGTH = 8_000;

const getSerializedLength = (value: unknown): number => {
  if (typeof value === "string") return value.length;

  try {
    return JSON.stringify(value)?.length ?? 0;
  } catch {
    return ANSWER_VALUE_MAX_LENGTH + 1;
  }
};

export const answersPayloadSchema = z.object({
  answers: z.record(z.string().min(1).max(100), z.unknown()).superRefine((answers, ctx) => {
    const entries = Object.entries(answers);
    if (entries.length > ANSWERS_MAX_KEYS) {
      ctx.addIssue({
        code: "custom",
        message: `回答は${ANSWERS_MAX_KEYS}項目以内で入力してください`,
      });
    }

    for (const [key, value] of entries) {
      if (getSerializedLength(value) > ANSWER_VALUE_MAX_LENGTH) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `回答は1項目あたり${ANSWER_VALUE_MAX_LENGTH}文字以内で入力してください`,
        });
      }
    }
  }),
});

export const calendarEventSchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1),
  company: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
});

export const companyFavoriteSchema = z.object({
  id: z.string().uuid(),
  favorite: z.boolean(),
});
