import { CalendarEvent } from "../calendar/types";
import { InteractiveCalendar } from "../interactive-calendar";

type Props = {
  events: CalendarEvent[];
};

export function CalendarSection({ events }: Props) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">締切カレンダー</h2>
        <span className="text-xs text-slate-500">ES / 面接 / インターン</span>
      </div>
      <div className="mt-3">
        <InteractiveCalendar initialEvents={events} />
      </div>
    </div>
  );
}
