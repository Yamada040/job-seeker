type Reflection = { improvement: string; unexpected: string };

type Props = {
  reflection: Reflection;
  onChange: (next: Reflection) => void;
};

export function InterviewReflectionSection({ reflection, onChange }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">次回改善したい点</span>
        <textarea
          value={reflection.improvement}
          onChange={(e) => onChange({ ...reflection, improvement: e.target.value })}
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          placeholder="例）結論を先に述べる / プロジェクトの定量成果を追加 など"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">想定外だった質問・論点</span>
        <textarea
          value={reflection.unexpected}
          onChange={(e) => onChange({ ...reflection, unexpected: e.target.value })}
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          placeholder="例）最近の業界トレンドについて深掘りされた など"
        />
      </label>
    </div>
  );
}
