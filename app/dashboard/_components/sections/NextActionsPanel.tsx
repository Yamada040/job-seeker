import Link from "next/link";

import { SimpleListModal } from "../simple-list-modal";
import { NextAction } from "../dashboard-helpers";

type Props = {
  actions: NextAction[];
};

export function NextActionsPanel({ actions }: Props) {
  return (
    <SimpleListModal
      trigger={
        <div className="cursor-pointer rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">次に取るべき行動</h3>
            <span className="text-[11px] text-slate-500">最大2件</span>
          </div>
          <div className="mt-3 space-y-3">
            {actions.map((action) => (
              <Link
                key={`${action.title}-${action.href}-${action.subtitle}`}
                href={action.href}
                className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
              >
                <p className="text-xs font-semibold text-amber-700">{action.title}</p>
                <p className="mt-1 text-base font-semibold">{action.subtitle}</p>
              </Link>
            ))}
            {actions.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-3 text-xs text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                取り掛かるべきアクションはありません。
              </div>
            )}
          </div>
        </div>
      }
      items={actions.map((action) => ({
        title: action.title,
        subtitle: action.subtitle,
        meta: action.href,
      }))}
      emptyText="アクションはありません。"
    />
  );
}
