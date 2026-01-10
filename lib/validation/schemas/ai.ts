import { z } from "zod";

export const aiRequestSchema = z.object({
  input: z.string().min(1),
  kind: z.enum(["es_review", "company_analysis", "aptitude_analysis", "self_analysis", "interview_review"]),
});

export const idAndSummarySchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
});

export const idAndOptionalSummarySchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
});

export const idAndSummaryStringSchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
});
