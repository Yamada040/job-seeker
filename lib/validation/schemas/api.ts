import { z } from "zod";

export const answersPayloadSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
});

export const calendarEventSchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1),
  company: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
});
