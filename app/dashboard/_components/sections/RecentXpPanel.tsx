import { SimpleListModal } from "../simple-list-modal";

type XpLog = {
  xp: number | null;
  action: string | null;
  created_at: string | null;
};

type Props = {
  logs: XpLog[];
};

export function RecentXpPanel({ logs }: Props) {
  return (
    <SimpleListModal
      trigger={
        <div className="cursor-pointer rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">最近の獲得</h3>
            <span className="text-[11px] text-slate-500">最新5件</span>
          </div>
          <div className="mt-3 space-y-2">
            {logs.map((log, idx) => (
              <div
                key={`${log.created_at}-${idx}`}
                className="rounded-xl border border-slate-200/70 bg-white/90 p-3 text-sm shadow-sm dark:border-slate-700/70 dark:bg-slate-800/80"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-50">+{log.xp} XP</span>
                  <span className="text-xs text-slate-500">
                    {log.created_at ? new Date(log.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{log.action || "行動"}</p>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-3 text-xs text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                まだXPはありません。ES提出や面接ログでXPを獲得できます。
              </div>
            )}
          </div>
        </div>
      }
      items={logs.map((log) => ({
        title: `+${log.xp} XP`,
        subtitle: log.action || "行動",
        meta: log.created_at ? new Date(log.created_at).toLocaleDateString() : "",
      }))}
      emptyText="XP獲得履歴がありません。"
    />
  );
}
