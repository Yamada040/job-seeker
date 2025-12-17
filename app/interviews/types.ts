import { Database } from "@/lib/database.types";

export type InterviewLogRow = Database["public"]["Tables"]["interview_logs"]["Row"];
export type InterviewLogInsert = Database["public"]["Tables"]["interview_logs"]["Insert"];
