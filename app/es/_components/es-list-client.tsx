"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Database } from "@/lib/database.types";

type EsRow = Database["public"]["Tables"]["es_entries"]["Row"];

type Props = {
  initialItems: EsRow[];
};

const TABS = [
  { label: "すべて", value: "all" },
  { label: "下書き", value: "draft" },
  { label: "提出済み", value: "submitted" },
] as const;

const STATUS_LABEL_MAP: Record<string, string> = {
  draft: "下書き",
  submitted: "提出済み",
};

export function EsListClient({ initialItems }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");
  const [query, setQuery] = useState("");

  const { filtered, counts } = useMemo(() => {
    const items = Array.isArray(initialItems) ? initialItems : [];
    const filtered = items.filter((item) => {
      const q = query.toLowerCase();
      const titleHit = (item.title || "").toLowerCase().includes(q);
      const tagHit = (item.tags ?? []).some((t) => t.toLowerCase().includes(q));
      return !query || titleHit || tagHit;
    });
    const byTab = filtered.filter((item) => (tab === "all" ? true : item.status === tab));
    return {
      filtered: byTab,
      counts: {
        all: filtered.length,
        draft: filtered.filter((i) => i.status === "draft").length,
        submitted: filtered.filter((i) => i.status === "submitted").length,
      },
    };
  }, [initialItems, query, tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-xs">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`rounded-full border px-3 py-1 ${
                tab === t.value ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {t.label}
              {counts?.[t.value] !== undefined ? ` (${counts[t.value as keyof typeof counts]})` : ""}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="タイトル / タグで検索"
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-900 outline-none ring-0 placeholder:text-slate-500 focus:border-amber-300 sm:w-64"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((es) => (
          <Link
            key={es.id}
            href={`/es/${es.id}`}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <p className="text-sm font-semibold">{es.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-700">
              <span className="rounded-full bg-slate-100 px-2 py-1">{STATUS_LABEL_MAP[es.status ?? ""] ?? "未設定"}</span>
              {es.tags?.length ? (
                es.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">タグなし</span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-600">更新日: {es.updated_at ? new Date(es.updated_at).toLocaleDateString() : "-"}</p>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-6 text-sm text-slate-700 shadow-soft">
            該当するESがありません。フィルタやキーワードを変えてみてください。
          </div>
        ) : null}
      </div>
    </div>
  );
}
