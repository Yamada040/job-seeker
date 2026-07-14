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

function formatScore(score: number | null) {
  return typeof score === "number" ? `${Math.round(score)}点` : "未採点";
}

export function EsListClient({ initialItems }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");
  const [query, setQuery] = useState("");

  const { filtered, counts, scoreTrend } = useMemo(() => {
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
      scoreTrend: items
        .filter((item) => typeof item.score === "number")
        .sort((a, b) => {
          const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
          const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
          return aTime - bTime;
        })
        .slice(-6),
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
                tab === t.value ? "border-white bg-black text-white" : "border-white/40 bg-black/70 text-white/70"
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
          className="w-full rounded-full border border-white/30 bg-black/70 px-4 py-2 text-xs text-white outline-none ring-0 placeholder:text-white/50 focus:border-yellow-400 sm:w-64"
        />
      </div>

      {scoreTrend.length ? (
        <div className="rounded-xl border border-yellow-300/30 bg-yellow-500/10 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-yellow-200">ES添削スコア推移</p>
              <p className="text-[11px] text-white/60">直近の採点済みESを更新順に表示</p>
            </div>
            <span className="rounded-full border border-yellow-300/40 bg-black/50 px-2 py-1 text-[11px] text-yellow-100">
              最新 {formatScore(scoreTrend.at(-1)?.score ?? null)}
            </span>
          </div>
          <div className="mt-3 flex h-24 items-end gap-2">
            {scoreTrend.map((item) => {
              const score = Math.round(item.score ?? 0);
              return (
                <div key={item.id} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <div className="flex h-16 w-full items-end rounded bg-black/40 px-1">
                    <div
                      className="w-full rounded-t bg-yellow-300"
                      style={{ height: `${Math.max(8, Math.min(100, score))}%` }}
                      title={`${item.title ?? "ES"}: ${score}点`}
                    />
                  </div>
                  <span className="w-full truncate text-center text-[10px] text-white/60">{score}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((es) => (
          <Link
            key={es.id}
            href={`/es/${es.id}`}
            className="rounded-xl border border-[#3f3f46] bg-[#111111] px-4 py-4 text-white transition hover:-translate-y-0.5"
          >
            <p className="text-sm font-semibold">{es.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
              <span className="rounded-full border border-white/40 bg-black/60 px-2 py-1 text-white">
                {STATUS_LABEL_MAP[es.status ?? ""] ?? "未設定"}
              </span>
              <span
                className={`rounded-full border px-2 py-1 ${
                  typeof es.score === "number"
                    ? "border-yellow-300/50 bg-yellow-500/20 text-yellow-100"
                    : "border-white/30 bg-black/40 text-white/50"
                }`}
              >
                {formatScore(es.score)}
              </span>
              {es.tags?.length ? (
                es.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-yellow-300/40 bg-yellow-500/20 px-2 py-1 text-yellow-200"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-white/50">タグなし</span>
              )}
            </div>
            <p className="mt-1 text-xs text-white/60">
              更新日: {es.updated_at ? new Date(es.updated_at).toLocaleDateString() : "-"}
            </p>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-[#3f3f46] bg-[#111111] px-6 py-6 text-sm text-white/80">
            該当するESがありません。フィルタやキーワードを変えてみてください。
          </div>
        ) : null}
      </div>
    </div>
  );
}
