import clsx from "clsx";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function CalendarWeekdays() {
  return (
    <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
      {WEEKDAYS.map((day, idx) => (
        <div
          key={day}
          className={clsx(
            "rounded-lg bg-white/60 py-2 shadow-sm backdrop-blur dark:bg-slate-900/70",
            idx === 0 && "text-rose-500",
            idx === 6 && "text-sky-500"
          )}
        >
          {day}
        </div>
      ))}
    </div>
  );
}
