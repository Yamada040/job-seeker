"use client";

import { useMemo, useState } from "react";

import { Database } from "@/lib/database.types";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

type Props = {
  items: CompanyRow[];
};

const STAGES = ["すべて", "未エントリー", "書類提出", "面接中", "カジュアル面談"] as const;

export function CompanyListClient({ items }: Props) {
  const [stage, setStage] = useState<(typeof STAGES)[number]>("すべて");
  const [favOnly, setFavOnly] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchStage = stage === "すべて" || item.stage === stage;
      const matchFav = !favOnly || Boolean(item.favorite);
      const matchQuery =
        !query ||
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.url ?? "").toLowerCase().includes(query.toLowerCase());
      return matchStage && matchFav && matchQuery;
    });
  }, [items, stage, favOnly, query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-xs">
          {STAGES.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setStage(opt)}
              className={`rounded-full px-3 py-1 ${
                stage === opt ? "bg-emerald-300/30 text-emerald-50 border border-emerald-300/50" : "bg-white/5 text-slate-100 border border-white/10"
              }`}
            >
              {opt}
            </button>
          ))}
          <label className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100">
            <input
              type="checkbox"
              checked={favOnly}
              onChange={(e) => setFavOnly(e.target.checked)}
              className="h-3 w-3 accent-amber-300"
            />
            お気に入りのみ
          </label>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="企業名/URLで検索"
          className="w-full rounded-full border border-white/10 bg-slate-900/40 px-4 py-2 text-xs text-white outline-none focus:border-emerald-300 sm:w-64"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((c) => (
          <a
            key={c.id}
            href={`/companies/${c.id}`}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{c.name}</p>
              {c.favorite ? <span className="rounded-full bg-amber-300/90 px-2 py-1 text-[11px] font-semibold text-slate-950">Fav</span> : null}
            </div>
            <p className="mt-1 text-xs text-slate-200/80">{c.url}</p>
            <p className="mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] text-slate-100">{c.stage}</p>
          </a>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-200/80">
            条件に合う企業がありません。フィルタをリセットしてください。
          </div>
        ) : null}
      </div>
    </div>
  );
}
