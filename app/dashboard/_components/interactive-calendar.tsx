"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  company?: string | null;
  type: "es" | "interview" | "intern" | "other";
  time?: string | null; // HH:MM
};

type Props = {
  initialEvents?: CalendarEvent[];
};

const TYPE_LABEL: Record<CalendarEvent["type"], string> = {
  es: "ES締切",
  interview: "面接",
  intern: "インターン",
  other: "その他",
};

export function InteractiveCalendar({ initialEvents = [] }: Props) {
  const emptyForm = {
    title: "",
    company: "",
    type: "es" as CalendarEvent["type"],
    time: "",
  };

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateKey(new Date()));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: { date: string; inCurrentMonth: boolean }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i -= 1) {
      const day = prevMonthDays - i;
      const date = formatDateKey(new Date(year, month - 1, day));
      cells.push({ date, inCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = formatDateKey(new Date(year, month, d));
      cells.push({ date, inCurrentMonth: true });
    }

    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const toAdd = 7 - remainder;
      for (let i = 1; i <= toAdd; i += 1) {
        const date = formatDateKey(new Date(year, month + 1, i));
        cells.push({ date, inCurrentMonth: false });
      }
    }

    return cells;
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((acc, evt) => {
      const key = evt.date;
      acc[key] = acc[key] ? [...acc[key], evt] : [evt];
      return acc;
    }, {});
  }, [events]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const openModalForDate = (date: string) => {
    setSelectedDate(date);
    setEditingId(null);
    setFormState({ ...emptyForm });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        date: selectedDate,
        title: formState.title || "予定",
        company: formState.company || undefined,
        type: formState.type,
        time: formState.time || null,
      };

      const res = await fetch(editingId ? `/api/calendar-events/${editingId}` : "/api/calendar-events", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.data) {
        throw new Error(json?.error ?? "保存に失敗しました");
      }

      const saved: CalendarEvent = {
        id: json.data.id,
        date: json.data.date,
        title: json.data.title,
        company: json.data.company,
        type: json.data.type,
        time: json.data.time,
      };

      setEvents((prev) => {
        const exists = prev.some((evt) => evt.id === saved.id);
        if (exists) return prev.map((evt) => (evt.id === saved.id ? saved : evt));
        return [...prev, saved];
      });
      setFormState({ ...emptyForm });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました。再度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  const handleEditPrefill = (evt: CalendarEvent) => {
    setSelectedDate(evt.date);
    setFormState({
      title: evt.title,
      company: evt.company || "",
      type: evt.type,
      time: evt.time || "",
    });
    setEditingId(evt.id);
    setIsModalOpen(true);
  };

  return (
    <div className="mt-4 space-y-4 text-slate-900 dark:text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrevMonth}
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
            onClick={handleNextMonth}
            className="rounded-full border border-slate-200 bg-white p-2 shadow hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
            aria-label="次の月へ"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => openModalForDate(formatDateKey(new Date()))}
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
        >
          <PlusIcon className="h-4 w-4" />
          今日に追加
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <div key={d} className="rounded-lg bg-white/60 py-2 shadow-sm backdrop-blur dark:bg-slate-900/70">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {monthDays.map(({ date, inCurrentMonth }) => {
          const day = new Date(date).getDate();
          const dayEvents = eventsByDate[date] || [];
          return (
            <button
              key={date}
              type="button"
              onClick={() => openModalForDate(date)}
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
                <span className={inCurrentMonth ? "" : "opacity-60"}>{day}</span>
                <span className="text-[10px] rounded-full border border-slate-200 px-2 py-0.5 text-amber-700 dark:border-slate-700 dark:text-amber-200">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-10">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">選択した日の予定</h3>
                <p className="text-xs text-slate-500">{selectedDate}</p>
              </div>
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-slate-700"
                onClick={() => setIsModalOpen(false)}
              >
                閉じる
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormState({ ...emptyForm });
                  setEditingId(null);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <PlusIcon className="h-4 w-4" />
                新しい予定を追加
              </button>
            </div>

            <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800">
              {eventsByDate[selectedDate]?.length ? (
                eventsByDate[selectedDate].map((evt) => (
                  <div
                    key={evt.id}
                    className={clsx(
                      "rounded-lg px-3 py-2",
                      evt.type === "es" && "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-100",
                      evt.type === "interview" &&
                        "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-100",
                      evt.type === "intern" &&
                        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100",
                      evt.type === "other" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    )}
                  >
                    <p className="text-xs font-semibold">{TYPE_LABEL[evt.type]}</p>
                    <p className="text-sm font-semibold">{evt.company || evt.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {evt.title} {evt.time ? `· ${evt.time}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      {evt.id.startsWith("es-") ? (
                        <a
                          href={`/es/${evt.id.replace("es-", "")}`}
                          className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          ES詳細へ
                        </a>
                      ) : null}
                      {!evt.id.startsWith("es-") && (
                        <button
                          type="button"
                          onClick={() => handleEditPrefill(evt)}
                          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-800 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-100"
                        >
                          予定を編集
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">この日に登録された予定はありません。</p>
              )}
            </div>

            <form
              className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700"
              onSubmit={handleSubmit}
            >
              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-slate-300">日付</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-slate-300">種別</label>
                  <select
                    value={formState.type}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        type: e.target.value as CalendarEvent["type"],
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="es">ES締切</option>
                    <option value="interview">面接</option>
                    <option value="intern">インターン</option>
                    <option value="other">その他</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-slate-300">時間（任意）</label>
                  <input
                    type="time"
                    value={formState.time}
                    onChange={(e) => setFormState((prev) => ({ ...prev, time: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-slate-300">企業名</label>
                <input
                  type="text"
                  value={formState.company}
                  onChange={(e) => setFormState((prev) => ({ ...prev, company: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  placeholder="例）テック株式会社"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-slate-300">タイトル</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  placeholder="例）一次面接 / ES締切"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormState({ ...emptyForm });
                    setEditingId(null);
                  }}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  入力をクリア
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
                  disabled={saving}
                >
                  <PlusIcon className="h-4 w-4" />
                  {saving ? "保存中..." : editingId ? "予定を更新" : "予定を保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
