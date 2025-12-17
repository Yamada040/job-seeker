import { Database } from "@/lib/database.types";

export type WebtestQuestionRow = Database["public"]["Tables"]["webtest_questions"]["Row"];
export type WebtestQuestionInsert = Database["public"]["Tables"]["webtest_questions"]["Insert"];

export type WebtestAttemptRow = Database["public"]["Tables"]["webtest_attempts"]["Row"];
export type WebtestAttemptInsert = Database["public"]["Tables"]["webtest_attempts"]["Insert"];
