import { Database } from "@/lib/database.types";

export type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
export type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];
// フォーム送信時に使うペイロード（user_id などサーバ側で補完する項目を除外）
export type CompanyFormPayload = Omit<
  CompanyInsert,
  "id" | "user_id" | "created_at" | "updated_at" | "ai_summary"
>;
