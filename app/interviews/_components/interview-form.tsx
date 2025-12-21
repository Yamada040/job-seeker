"use client";

import { useMemo, useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

import { AiPanel } from "@/app/_components/ai-panel";
import { InterviewQA, InterviewQuestionsPayload } from "../types";
import { MAX_TEXT_LEN, tooLong } from "@/app/_components/validation";

type CompanyOption = { value: string; label: string };

type Props = {
  mode: "create" | "update";
  interviewId?: string;
  initialCompanyName?: string;
  companyOptions?: CompanyOption[];
  initialStage?: string | null;
  initialDate?: string | null;
  initialSelfReview?: string | null;
  initialQuestions?: InterviewQuestionsPayload | null;
  initialFormat?: string | null;
  initialAiSummary?: string | null;
  initialIsTemplate?: boolean;
};

type Reflection = { improvement: string; unexpected: string };

const emptyQA: InterviewQA = { question: "", answer: "", rating: "average" };

function normalizeInitialQuestions(input?: InterviewQuestionsPayload | null): {
  items: InterviewQA[];
  reflection: Reflection;
} {
  const baseReflection: Reflection = { improvement: "", unexpected: "" };
  if (!input) return { items: [{ ...emptyQA }, { ...emptyQA }], reflection: baseReflection };
  if (Array.isArray(input)) {
    const items = input.length ? input : [{ ...emptyQA }];
    return { items: items.map((q) => ({ question: q.question, answer: q.answer, rating: q.rating ?? "average" })), reflection: baseReflection };
  }
  const items = (input.items?.length ? input.items : [{ ...emptyQA }]).map((q) => ({
    question: q.question,
    answer: q.answer,
    rating: q.rating ?? "average",
  }));
  return {
    items,
    reflection: {
      improvement: input.reflection?.improvement ?? "",
      unexpected: input.reflection?.unexpected ?? "",
    },
  };
}

export default function InterviewForm({
  mode,
  interviewId,
  initialCompanyName,
  companyOptions = [],
  initialStage,
  initialDate,
  initialSelfReview,
  initialQuestions,
  initialFormat,
  initialAiSummary,
  initialIsTemplate,
}: Props) {
  const parsedQuestions = normalizeInitialQuestions(initialQuestions);
  const [companyName, setCompanyName] = useState(initialCompanyName ?? "");
  const [format, setFormat] = useState(initialFormat ?? "オンライン");
  const [stage, setStage] = useState(initialStage ?? "");
  const [date, setDate] = useState(initialDate ?? "");
  const [asTemplate, setAsTemplate] = useState(Boolean(initialIsTemplate));
  const [selfReview, setSelfReview] = useState(initialSelfReview ?? "");
  const [reflection, setReflection] = useState<Reflection>(parsedQuestions.reflection);
  const [questions, setQuestions] = useState<InterviewQA[]>(parsedQuestions.items);
  const [saving, setSaving] = useState(false);
  const [resultId, setResultId] = useState<string | null>(interviewId ?? null);
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);
  const [presetText, setPresetText] = useState<string>("");

  const prompt = useMemo(() => {
    const lines = [
      `企業名: ${companyName || "未入力"}`,
      `面接形式: ${format || "未入力"}`,
      `面接回数: ${stage || "未入力"}`,
      `実施日: ${date || "未入力"}`,
      "",
      "質問と回答・自己評価",
      ...questions.map(
        (qa, idx) =>
          `${idx + 1}. Q: ${qa.question || "未入力"} / A: ${qa.answer || "未入力"} / 評価: ${
            qa.rating === "good" ? "良い" : qa.rating === "bad" ? "悪い" : "普通"
          }`
      ),
      "",
      `改善したい点: ${reflection.improvement || "未入力"}`,
      `想定外だったこと: ${reflection.unexpected || "未入力"}`,
      `メモ: ${selfReview || "未入力"}`,
    ];
    return lines.join("\n");
  }, [companyName, date, format, questions, reflection.improvement, reflection.unexpected, selfReview, stage]);

  const handleQAChange = (index: number, key: keyof InterviewQA, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addQA = () => setQuestions((prev) => [...prev, { ...emptyQA }]);
  const removeQA = (idx: number) => setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const handleTemplateToggle = (checked: boolean) => {
    setAsTemplate(checked);
    if (checked) {
      setStage("template");
      setDate("");
    }
  };

  const withMissingOption = (): CompanyOption[] => {
    if (companyName && !companyOptions.find((o) => o.value === companyName)) {
      return [{ value: companyName, label: `${companyName}（新規）` }, ...companyOptions];
    }
    return companyOptions;
  };

  const ensureLength = (value: string, label: string) => {
    if (value && value.length > MAX_TEXT_LEN) {
      throw new Error(tooLong(label));
    }
  };

  const buildPayload = () => {
    const trimmedQuestions = questions
      .map((q) => ({
        question: q.question.trim(),
        answer: q.answer.trim(),
        rating: q.rating ?? "average",
      }))
      .filter((q) => q.question || q.answer);

    if (!trimmedQuestions.length) {
      throw new Error("質問と回答を1件以上入力してください");
    }
    if (!companyName.trim()) throw new Error("企業名は必須です");
    ensureLength(companyName.trim(), "企業名");
    ensureLength(format.trim(), "面接形式");
    ensureLength(stage.trim(), "面接回数/ステージ");
    if (!asTemplate) {
      if (!stage.trim()) throw new Error("面接回数を入力してください（一次/最終など）");
      if (!date) throw new Error("実施日を入力してください");
    }

    const reflectionText = [
      reflection.improvement ? `改善したい点: ${reflection.improvement}` : "",
      reflection.unexpected ? `想定外だったこと: ${reflection.unexpected}` : "",
      selfReview ? `メモ: ${selfReview}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      companyName: companyName.trim(),
      interviewFormat: format.trim(),
      interviewTitle: format.trim(),
      stage: asTemplate ? "template" : stage.trim(),
      interviewDate: asTemplate ? null : date,
      selfReview: reflectionText || null,
      questions: { items: trimmedQuestions, reflection },
      template: asTemplate,
    };
  };

  const handleSave = async () => {
    try {
      const payload = buildPayload();
      setSaving(true);
      const isUpdate = mode === "update" && interviewId;
      const endpoint = isUpdate ? `/api/interviews/${interviewId}` : "/api/interviews";
      const method = isUpdate ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.id) {
        throw new Error(json?.error || "保存に失敗しました");
      }
      setResultId(json.id);
      setPresetText(prompt);
      setPresetKey(`${Date.now()}`);
      alert("保存しました");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "保存に失敗しました";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
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
            <Field
              label="面接形式"
              value={format}
              onChange={setFormat}
              placeholder="対面 / オンライン / ハイブリッド など"
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="面接回数（必須）"
              value={stage}
              onChange={setStage}
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
                    onChange={(e) => handleTemplateToggle(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  準備用の雛形として保存（実施日なし）
                </label>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required={!asTemplate}
                disabled={asTemplate}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">質問ログ（質問・回答・自己評価）</span>
              <button type="button" onClick={addQA} className="mvp-button mvp-button-secondary">
                <PlusIcon className="h-4 w-4" />
                行を追加
              </button>
            </div>
            <div className="space-y-3">
              {questions.map((qa, idx) => (
                <div
                  key={`${idx}-${qa.question}-${qa.answer}`}
                  className="space-y-3 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/80"
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    <Field
                      label={`質問 ${idx + 1}`}
                      value={qa.question}
                      onChange={(v) => handleQAChange(idx, "question", v)}
                      placeholder="自己紹介をお願いします など"
                    />
                    <Field
                      label="自分の回答（要点）"
                      value={qa.answer}
                      onChange={(v) => handleQAChange(idx, "answer", v)}
                      placeholder="研究概要と志望理由を簡潔に述べた"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs text-slate-600 dark:text-slate-300">自己評価</label>
                    <select
                      value={qa.rating}
                      onChange={(e) => handleQAChange(idx, "rating", e.target.value as InterviewQA["rating"])}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="good">良い</option>
                      <option value="average">普通</option>
                      <option value="bad">悪い</option>
                    </select>
                    {questions.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeQA(idx)}
                        className="ml-auto inline-flex items-center gap-1 text-xs text-rose-500 hover:underline"
                      >
                        <TrashIcon className="h-4 w-4" />
                        削除
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">次回改善したい点</span>
              <textarea
                value={reflection.improvement}
                onChange={(e) => setReflection((prev) => ({ ...prev, improvement: e.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="例）結論を先に述べる / プロジェクトの定量成果を追加 など"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">想定外だった質問・論点</span>
              <textarea
                value={reflection.unexpected}
                onChange={(e) => setReflection((prev) => ({ ...prev, unexpected: e.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="例）最近の業界トレンドについて深掘りされた など"
              />
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">メモ（任意）</span>
            <textarea
              value={selfReview}
              onChange={(e) => setSelfReview(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="感想ではなく、次に活かすためのメモを残してください"
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
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
