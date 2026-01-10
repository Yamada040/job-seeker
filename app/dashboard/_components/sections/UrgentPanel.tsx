import { CalendarEvent } from "../calendar/types";
import { EventListModal } from "../event-list-modal";

type Props = {
  events: CalendarEvent[];
  today: Date;
};

export function UrgentPanel({ events, today }: Props) {
  const urgentEvents = events.filter((evt) => {
    const date = evt.date ? new Date(evt.date) : null;
    if (!date) return false;
    const diff = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7 && (evt.type === "es" || evt.type === "interview");
  });

  return (
    <EventListModal
      events={events}
      trigger={
        <div className="cursor-pointer rounded-2xl border border-amber-100 bg-amber-50/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-amber-500/30 dark:bg-amber-900/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">直近で注意すべきこと</h3>
            <span className="text-[11px] text-amber-800/80 dark:text-amber-100/80">7日以内を表示</span>
          </div>
          <div className="mt-3 space-y-3">
            {urgentEvents.slice(0, 4).map((evt) => (
              <div key={evt.id} className="rounded-xl bg-white/70 p-3 text-sm shadow-sm dark:bg-amber-900/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{evt.type === "es" ? "ES締切" : "面接"}</span>
                  <span>{evt.date}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-amber-900 dark:text-amber-50">{evt.company || evt.title}</p>
                <p className="text-xs text-amber-800/80 dark:text-amber-100/80">{evt.title}</p>
              </div>
            ))}
            {urgentEvents.length === 0 && (
              <div className="rounded-xl border border-dashed border-amber-200/80 bg-white/50 p-3 text-xs text-amber-800 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-50">
                直近1週間の締切・面接はありません。
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
