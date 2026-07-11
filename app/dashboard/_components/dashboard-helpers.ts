import { CalendarEvent } from "./calendar/types";
import { Database } from "@/lib/database.types";
import { ROUTES } from "@/lib/constants/routes";

type EsRow = Database["public"]["Tables"]["es_entries"]["Row"];
type CalendarRow = Database["public"]["Tables"]["calendar_events"]["Row"];
type InterviewRow = Database["public"]["Tables"]["interview_logs"]["Row"];

export type NextAction = {
  title: string;
  subtitle: string;
  href: string;
};

export function buildCalendarEvents(calendarRows: CalendarRow[], esEntries: EsRow[]): CalendarEvent[] {
  return [
    ...calendarRows.map((evt) => ({
      id: evt.id,
      date: evt.date ?? "",
      title: evt.title ?? "予定",
      company: evt.company ?? null,
      type: (evt.type as CalendarEvent["type"]) ?? "other",
      time: evt.time ?? null,
    })),
    ...esEntries
      .filter((es) => !!es.deadline)
      .map((es) => ({
        id: `es-${es.id}`,
        date: es.deadline as string,
        title: es.title || "ES締切",
        company: es.company_name,
        type: "es" as const,
        time: null,
      })),
  ];
}

export function buildPendingEs(esEntries: EsRow[], today: Date) {
  return [...esEntries]
    .filter((es) => es.status !== "submitted" && es.deadline && new Date(es.deadline) >= today)
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
}

export function buildInterviewActions(calendarEvents: CalendarEvent[], interviewLogs: InterviewRow[], today: Date) {
  const pastInterviews = calendarEvents.filter((evt) => {
    if (evt.type !== "interview") return false;
    const date = evt.date ? new Date(evt.date) : null;
    return date ? date < today : false;
  });
  const missing = pastInterviews.filter((evt) => {
    const hasLog = interviewLogs.some((log) => log.company_name === evt.company && log.interview_date === evt.date);
    return !hasLog;
  });
  return missing.slice(0, 1).map((evt) => ({
    title: "面接ログを記録",
    subtitle: evt.company || evt.title,
    href: ROUTES.INTERVIEWS,
  }));
}
