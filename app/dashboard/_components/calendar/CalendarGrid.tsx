import clsx from "clsx";

import { TYPE_LABEL } from "./constants";
import { CalendarDayCell, CalendarEvent } from "./types";

type Props = {
  monthDays: CalendarDayCell[];
  eventsByDate: Record<string, CalendarEvent[]>;
  onSelectDate: (date: string) => void;
};

export function CalendarGrid({ monthDays, eventsByDate, onSelectDate }: Props) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {monthDays.map(({ date, inCurrentMonth }) => {
        const jsDate = new Date(date);
        const day = jsDate.getDate();
        const weekday = jsDate.getDay();
        const dayEvents = eventsByDate[date] || [];
        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelectDate(date)}
            className={clsx(
              "min-h-[120px] rounded-2xl border p-2 text-left shadow-sm transition",
              "bg-white/80 backdrop-blur hover:-translate-y-0.5 hover:shadow-md",
              "dark:bg-slate-900/80 dark:hover:bg-slate-900",
              inCurrentMonth
                ? "border-slate-200 dark:border-slate-700"
                : "border-dashed border-slate-200/70 text-slate-400 dark:border-slate-700/70 opacity-60"
            )}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span
                className={clsx(
                  inCurrentMonth ? "" : "opacity-60",
                  weekday === 0 && "text-rose-500",
                  weekday === 6 && "text-sky-500"
                )}
              >
                {day}
              </span>
              <span
                className={clsx(
                  "text-[10px] rounded-full border px-2 py-0.5",
                  "border-slate-200 text-amber-700 dark:border-slate-700 dark:text-amber-200"
                )}
              >
                ＋
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {dayEvents.slice(0, 2).map((evt) => (
                <div
                  key={evt.id}
                  className={clsx(
                    "rounded-xl px-2 py-1 text-[11px] leading-tight",
                    evt.type === "es" && "bg-rose-50 text-rose-700",
                    evt.type === "interview" && "bg-indigo-50 text-indigo-700",
                    evt.type === "intern" && "bg-emerald-50 text-emerald-700",
                    evt.type === "other" && "bg-slate-100 text-slate-700"
                  )}
                >
                  <p className="font-semibold">{evt.company || evt.title}</p>
                  <p className="text-[10px]">
                    {TYPE_LABEL[evt.type]}
                    {evt.time ? ` · ${evt.time}` : ""}
                  </p>
                </div>
              ))}
              {dayEvents.length > 2 && <p className="text-[10px] text-slate-500">+{dayEvents.length - 2}件</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
