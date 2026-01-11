import { Database } from "@/lib/database.types";

export type AptitudeResult = Database["public"]["Tables"]["aptitude_results"]["Row"];
export type AptitudeInsert = Database["public"]["Tables"]["aptitude_results"]["Insert"];
// answers は jsonb なので UI では自由形式のマップとして扱う
export type AptitudeAnswers = Record<string, unknown>;

export type Answers = {
  interests: string[];
  strengths: string[];
  values: string[];
  enjoy: string;
  achievements: string;
  dislike: string;
  workStyle: string;
  location: string;
  industryWish: string;
  roleWish: string;
  otherNotes: string;
  mbti: string;
};
