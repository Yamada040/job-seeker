import { Database } from "@/lib/database.types";

export type InterviewLogRow = Database["public"]["Tables"]["interview_logs"]["Row"];
export type InterviewLogInsert = Database["public"]["Tables"]["interview_logs"]["Insert"];

export type InterviewQA = {
  question: string;
  answer: string;
  rating: "good" | "average" | "bad";
};

export type InterviewQuestionsPayload =
  | {
      items: InterviewQA[];
      reflection?: {
        improvement?: string;
        unexpected?: string;
      };
    }
  | InterviewQA[];
