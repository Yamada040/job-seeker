"use client";

import { useMemo, useState } from "react";

import { CalendarGrid } from "./calendar/CalendarGrid";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarModal } from "./calendar/CalendarModal";
import { CalendarWeekdays } from "./calendar/CalendarWeekdays";
import { CalendarDayCell, CalendarEvent, CalendarFormState } from "./calendar/types";
import { formatDateKey } from "./calendar/utils";

type Props = {
  initialEvents?: CalendarEvent[];
};

export function InteractiveCalendar({ initialEvents = [] }: Props) {
  const emptyForm: CalendarFormState = {
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

  const monthDays = useMemo<CalendarDayCell[]>(() => {
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
      <CalendarHeader
        currentMonth={currentMonth}
        onPrev={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
        onNext={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
        onTodayAdd={() => openModalForDate(formatDateKey(new Date()))}
      />

      <CalendarWeekdays />

      <CalendarGrid monthDays={monthDays} eventsByDate={eventsByDate} onSelectDate={openModalForDate} />

      {isModalOpen && (
        <CalendarModal
          selectedDate={selectedDate}
          eventsByDate={eventsByDate}
          formState={formState}
          editingId={editingId}
          saving={saving}
          onClose={() => setIsModalOpen(false)}
          onNew={() => {
            setFormState({ ...emptyForm });
            setEditingId(null);
          }}
          onEdit={handleEditPrefill}
          onClear={() => {
            setFormState({ ...emptyForm });
            setEditingId(null);
          }}
          onDateChange={setSelectedDate}
          onFormChange={(next) => setFormState((prev) => ({ ...prev, ...next }))}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
