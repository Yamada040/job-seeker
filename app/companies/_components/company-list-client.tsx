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
                stage === opt
                  ? "border border-emerald-300/50 bg-emerald-500/20 text-emerald-200"
                  : "border border-white/40 bg-black/60 text-white/80"
              }`}
            >
              {opt}
            </button>
          ))}
          <label className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-black/60 px-3 py-1 text-xs text-white/80">
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
          className="dq-input text-xs sm:w-64"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((c) => (
          <a key={c.id} href={`/companies/${c.id}`} className="dq-card p-4 transition hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{c.name}</p>
              {c.favorite ? (
                <span className="rounded-full border border-yellow-300/60 bg-yellow-300/80 px-2 py-1 text-[11px] font-semibold text-slate-950">
                  Fav
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-white/70">{c.url}</p>
            <p className="mt-2 inline-flex rounded-full border border-white/40 bg-black/60 px-3 py-1 text-[11px] text-white/80">
              {c.stage}
            </p>
          </a>
        ))}
        {filtered.length === 0 ? (
          <div className="dq-panel border-dashed p-6 text-sm text-white/60">
            条件に合う企業がありません。フィルタをリセットしてください。
          </div>
        ) : null}
      </div>
    </div>
  );
}
