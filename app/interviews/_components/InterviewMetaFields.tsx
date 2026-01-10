import { Field, SelectField, CompanyOption } from "./interview-fields";

type Props = {
  companyName: string;
  format: string;
  stage: string;
  date: string;
  asTemplate: boolean;
  companyOptions: CompanyOption[];
  onCompanyChange: (value: string) => void;
  onFormatChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTemplateToggle: (checked: boolean) => void;
};

function withMissingOption(companyName: string, companyOptions: CompanyOption[]) {
  if (companyName && !companyOptions.find((o) => o.value === companyName)) {
    return [{ value: companyName, label: `${companyName}（新規）` }, ...companyOptions];
  }
  return companyOptions;
}

export function InterviewMetaFields({
  companyName,
  format,
  stage,
  date,
  asTemplate,
  companyOptions,
  onCompanyChange,
  onFormatChange,
  onStageChange,
  onDateChange,
  onTemplateToggle,
}: Props) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {companyOptions.length > 0 ? (
          <SelectField
            label="企業名（必須）"
            value={companyName}
            onChange={onCompanyChange}
            options={withMissingOption(companyName, companyOptions)}
            required
            placeholder="企業管理から選択"
          />
        ) : (
          <Field
            label="企業名（必須）"
            value={companyName}
            onChange={onCompanyChange}
            required
            placeholder="例）Alpha株式会社"
          />
        )}
        <Field
          label="面接形式"
          value={format}
          onChange={onFormatChange}
          placeholder="対面 / オンライン / ハイブリッド など"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="面接回数（必須）"
          value={stage}
          onChange={onStageChange}
          placeholder="一次 / 二次 / 最終 など"
          required={!asTemplate}
        />
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>実施日（必須）</span>
            <label className="inline-flex items-center gap-1 text-xs font-normal text-slate-500">
              <input
                type="checkbox"
                checked={asTemplate}
                onChange={(e) => onTemplateToggle(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
              />
              準備用の雛形として保存（実施日なし）
            </label>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            required={!asTemplate}
            disabled={asTemplate}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    </>
  );
}
