type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function InterviewSelfReviewSection({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">メモ（任意）</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        placeholder="感想ではなく、次に活かすためのメモを残してください"
      />
    </div>
  );
}
