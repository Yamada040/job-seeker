type CheckboxGroupProps = {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
};

export function CheckboxGroup({ label, options, selected, onToggle }: CheckboxGroupProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TextArea({ label, value, onChange }: TextAreaProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
    </label>
  );
}

type SelectBoxProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
};

export function SelectBox({ label, value, onChange, options, placeholder }: SelectBoxProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">{placeholder || "選択してください"}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
