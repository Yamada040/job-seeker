"use client";

import { useMemo, useState } from "react";

import { Database } from "@/lib/database.types";

type EsRow = Database["public"]["Tables"]["es_entries"]["Row"];

type Props = {
  items: EsRow[];
};

const STATUS_OPTIONS = ["すべて", "下書き", "提出済", "添削済"] as const;

export function EsListClient({ items }: Props) {
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("すべて");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchStatus = status === "すべて" || item.status === status;
      const matchQuery =
        !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.tags ?? []).some((t) => t.toLowerCase().includes(query.toLowerCase()));
      return matchStatus && matchQuery;
    });
  }, [items, status, query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-xs">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setStatus(opt)}
              className={`rounded-full px-3 py-1 ${
                status === opt ? "bg-amber-300/30 text-amber-50 border border-amber-300/50" : "bg-white/5 text-slate-100 border border-white/10"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="タイトル/タグで検索"
          className="w-full rounded-full border border-white/10 bg-slate-900/40 px-4 py-2 text-xs text-white outline-none focus:border-amber-300 sm:w-64"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((es) => (
          <a
            key={es.id}
            href={`/es/${es.id}`}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur"
          >
            <p className="text-sm font-semibold text-white">{es.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-200/80">
              <span className="rounded-full bg-white/10 px-2 py-1">{es.status}</span>
              {es.tags?.length ? (
                es.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-amber-100">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">タグなし</span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-200/70">更新: {es.updated_at ? new Date(es.updated_at).toLocaleDateString() : "-"}</p>
          </a>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-200/80">
            条件に合うESがありません。フィルタをリセットしてください。
          </div>
        ) : null}
      </div>
    </div>
  );
}
