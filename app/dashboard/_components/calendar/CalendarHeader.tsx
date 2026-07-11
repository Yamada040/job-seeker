import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";

type Props = {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
  onTodayAdd: () => void;
};

export function CalendarHeader({ currentMonth, onPrev, onNext, onTodayAdd }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-full border border-slate-200 bg-white p-2 shadow hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
          aria-label="前の月へ"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <div className="text-lg font-semibold">
          {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
        </div>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full border border-slate-200 bg-white p-2 shadow hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
          aria-label="次の月へ"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onTodayAdd}
        className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
      >
        <PlusIcon className="h-4 w-4" />
        今日に追加
      </button>
    </div>
  );
}
