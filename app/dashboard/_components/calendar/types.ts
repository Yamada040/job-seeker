export type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  company?: string | null;
  type: "es" | "interview" | "intern" | "other";
  time?: string | null; // HH:MM
};

export type CalendarFormState = {
  title: string;
  company: string;
  type: CalendarEvent["type"];
  time: string;
};

export type CalendarDayCell = {
  date: string;
  inCurrentMonth: boolean;
};
