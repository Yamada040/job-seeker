import { z } from "zod";

const interviewQASchema = z.object({
  question: z.string(),
  answer: z.string(),
  rating: z.enum(["good", "average", "bad"]).optional(),
});

const questionsPayloadSchema = z.union([
  z.array(interviewQASchema),
  z.object({
    items: z.array(interviewQASchema),
    reflection: z
      .object({
        improvement: z.string().optional(),
        unexpected: z.string().optional(),
      })
      .optional(),
  }),
]);

export const interviewRequestSchema = z.object({
  companyName: z.string().min(1),
  template: z.boolean().optional(),
  stage: z.string().optional(),
  interviewDate: z.string().optional().nullable(),
  interviewFormat: z.string().optional(),
  interviewTitle: z.string().optional(),
  questions: questionsPayloadSchema.optional(),
});
