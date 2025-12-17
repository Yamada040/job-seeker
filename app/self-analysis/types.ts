import { Database } from "@/lib/database.types";

export type SelfAnalysisResult = Database["public"]["Tables"]["self_analysis_results"]["Row"];
export type SelfAnalysisInsert = Database["public"]["Tables"]["self_analysis_results"]["Insert"];
export type SelfAnalysisAnswers = Record<string, unknown>;
