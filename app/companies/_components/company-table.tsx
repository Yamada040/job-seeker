"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ROUTES } from "@/lib/constants/routes";

type Company = {
  id: string;
  name: string;
  industry?: string | null;
  stage?: string | null;
  preference?: number | null;
  memo?: string | null;
};

export function CompanyTable({ items }: { items: Company[] }) {
  const [industry, setIndustry] = useState<string>("");
  const [keyword, setKeyword] = useState("");

  const industryOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((c) => {
      if (c.industry) set.add(c.industry);
    });
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      const matchIndustry = industry ? c.industry === industry : true;
      const kw = keyword.trim().toLowerCase();
      const matchKeyword = kw
        ? [c.name, c.stage, c.memo, c.industry].some((v) => (v || "").toLowerCase().includes(kw))
        : true;
      return matchIndustry && matchKeyword;
    });
  }, [industry, items, keyword]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="dq-panel flex items-center gap-2 px-3 py-2 text-sm text-white">
            <MagnifyingGlassIcon className="h-4 w-4 text-white/60" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="企業名・メモで検索"
              className="bg-transparent text-sm outline-none placeholder:text-white/50"
            />
          </div>
          <div className="dq-panel flex items-center gap-2 px-3 py-2 text-sm text-white">
            <span className="text-xs text-white/60">業界</span>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option value="">すべて</option>
              {industryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="dq-card overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-white/10 text-sm text-white">
          <thead className="bg-black/60">
            <tr>
              <Th className="w-[35%]">企業名</Th>
              <Th className="w-[30%]">業界</Th>
              <Th className="w-[20%]">ステータス</Th>
              <Th className="w-[15%]">志望度</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-white/60">
                  該当する企業がありません。
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/5">
                  <Td className="truncate">
                    <Link 
                      href={ROUTES.COMPANY_DETAIL(c.id)} 
                      className="font-semibold text-yellow-200 hover:underline block truncate"
                      title={c.name}
                    >
                      {c.name}
                    </Link>
                  </Td>
                  <Td className="truncate">
                    <span title={c.industry || "-"} className="block truncate">
                      {c.industry || "-"}
                    </span>
                  </Td>
                  <Td className="truncate">
                    <span title={c.stage || "未設定"} className="block truncate">
                      {c.stage || "未設定"}
                    </span>
                  </Td>
                  <Td>
                    <span className="rounded-full border border-yellow-300/40 bg-yellow-500/20 px-2 py-1 text-xs text-yellow-200 inline-block">
                      {c.preference ?? "-"}
                    </span>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Th = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/70 ${className}`}>{children}</th>
);
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 align-top text-white/90 ${className}`}>{children}</td>
);
