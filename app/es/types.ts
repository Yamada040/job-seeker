import { Database } from "@/lib/database.types";

export type EsEntryRow = Database["public"]["Tables"]["es_entries"]["Row"];
export type EsEntryInsert = Database["public"]["Tables"]["es_entries"]["Insert"];
