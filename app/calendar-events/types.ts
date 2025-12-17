import { Database } from "@/lib/database.types";

export type CalendarEventRow = Database["public"]["Tables"]["calendar_events"]["Row"];
export type CalendarEventInsert = Database["public"]["Tables"]["calendar_events"]["Insert"];
