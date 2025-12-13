"use client";

import { useMemo, useState } from "react";
import { AiPanel } from "@/app/_components/ai-panel";

type QA = { question: string; answer: string };

type CompanyOption = { value: string; label: string };

type Props = {
  mode: "create" | "update";
  interviewId?: string;
  initialCompanyName?: string;
  companyOptions?: CompanyOption[];
  initialTitle?: string | null;
  initialStage?: string | null;
  initialDate?: string | null;
  initialSelfReview?: string | null;
  initialQuestions?: QA[] | null;
  initialAiSummary?: string | null;
};

const emptyQA: QA = { question: "", answer: "" };

export default function InterviewForm({
  mode,
  interviewId,
  initialCompanyName,
  companyOptions = [],
  initialTitle,
  initialStage,
  initialDate,
  initialSelfReview,
  initialQuestions,
  initialAiSummary,
}: Props) {
  const [companyName, setCompanyName] = useState(initialCompanyName ?? "");
  const [title, setTitle] = useState(initialTitle ?? "");
  const [stage, setStage] = useState(initialStage ?? "");
  const [date, setDate] = useState(initialDate ?? "");
  const [selfReview, setSelfReview] = useState(initialSelfReview ?? "");
  const [questions, setQuestions] = useState<QA[]>(() => (initialQuestions && initialQuestions.length ? initialQuestions : [{ ...emptyQA }]));
  const [saving, setSaving] = useState(false);
  const [resultId, setResultId] = useState<string | null>(interviewId ?? null);
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);
  const [presetText, setPresetText] = useState<string>("");

  const prompt = useMemo(() => {
    const lines = [
      `企業名: ${companyName || "未入力"}`,
      `タイトル/面接種別: ${title || "未入力"}`,
      `ステータス: ${stage || "未入力"}`,
      `実施日: ${date || "未入力"}`,
      "",
      "質問と回答:",
      ...questions.map((qa, idx) => `${idx + 1}. Q: ${qa.question || "未入力"} / A: ${qa.answer || "未入力"}`),
      "",
      `自己評価・振り返り: ${selfReview || "未入力"}`,
    ];
    return lines.join("\n");
  }, [companyName, date, questions, selfReview, stage, title]);

  const handleQAChange = (index: number, key: keyof QA, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addQA = () => setQuestions((prev) => [...prev, { ...emptyQA }]);
  const removeQA = (idx: number) => setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!companyName.trim()) {
      alert("企業名は必須です。企業管理で登録した企業を選択してください。");
      return;
    }
    setSaving(true);
    try {
      const isUpdate = mode === "update" && interviewId && interviewId !== "undefined" && interviewId !== "null";
      const endpoint = isUpdate ? `/api/interviews/${interviewId}` : "/api/interviews";
      const method = isUpdate ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          interviewTitle: title.trim() || null,
          stage: stage.trim() || null,
          interviewDate: date || null,
          selfReview: selfReview.trim() || null,
          questions: questions,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.id) {
        throw new Error(json?.error || "保存に失敗しました");
      }
      setResultId(json.id);
      setPresetText(prompt);
      setPresetKey(`${Date.now()}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const withMissingOption = (): CompanyOption[] => {
    if (companyName && !companyOptions.find((o) => o.value === companyName)) {
      return [{ value: companyName, label: `${companyName}（既存データ）` }, ...companyOptions];
    }
    return companyOptions;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">面接内容を記録</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">質問・回答・自己評価を残して振り返りに活用します</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {companyOptions.length > 0 ? (
              <SelectField
                label="企業名（必須）"
                value={companyName}
                onChange={setCompanyName}
                options={withMissingOption()}
                required
                placeholder="企業管理から選択"
              />
            ) : (
              <Field label="企業名（必須）" value={companyName} onChange={setCompanyName} required placeholder="例）Alpha株式会社" />
            )}
            <Field label="タイトル/面接種別" value={title} onChange={setTitle} placeholder="一次/最終/カジュアルなど" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="ステータス" value={stage} onChange={setStage} placeholder="実施予定/完了/結果待ち など" />
            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">日付</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">質問ログ</span>
              <button type="button" onClick={addQA} className="mvp-button mvp-button-secondary">
                行を追加
              </button>
            </div>
            <div className="space-y-3">
              {questions.map((qa, idx) => (
                <div
                  key={`${idx}-${qa.question}-${qa.answer}`}
                  className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/80"
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    <Field
                      label={`質問 ${idx + 1}`}
                      value={qa.question}
                      onChange={(v) => handleQAChange(idx, "question", v)}
                      placeholder="自己紹介をお願いします"
                    />
                    <Field
                      label="自分の回答"
                      value={qa.answer}
                      onChange={(v) => handleQAChange(idx, "answer", v)}
                      placeholder="研究概要と志望理由を簡潔に述べた"
                    />
                  </div>
                  {questions.length > 1 ? (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeQA(idx)}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        この行を削除
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">自己評価・振り返り</span>
            <textarea
              value={selfReview}
              onChange={(e) => setSelfReview(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="良かった点・改善点・次に試すことなど"
            />
          </div>

          <div className="mt-6 flex justify-start">
            <button type="button" onClick={handleSave} disabled={saving} className="mvp-button mvp-button-primary">
              {saving ? "保存中..." : "保存する"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <AiPanel
          kind="interview_review"
          defaultInput={prompt}
          presetText={presetText}
          presetKey={presetKey}
          cacheKey={resultId ? `interview-${resultId}` : undefined}
          initialSummary={initialAiSummary ?? undefined}
          saveUrl="/api/ai/interview"
          saveId={resultId ?? undefined}
          title="AI改善サマリー（任意）"
          hint="保存後は再実行できません。必要な時だけ実行してください。"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: CompanyOption[];
  required?: boolean;
  placeholder?: string;
}) {
  const opts = options;
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="" disabled className="text-slate-400">
          {placeholder || "選択してください"}
        </option>
        {opts.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
