"use client";

import { useMemo, useState } from "react";
import { AiPanel } from "@/app/_components/ai-panel";
import { InterviewQA, InterviewQuestionsPayload } from "../types";
import { MAX_TEXT_LEN, tooLong } from "@/app/_components/validation";
import { CompanyOption } from "./interview-fields";
import { InterviewMetaFields } from "./InterviewMetaFields";
import { InterviewQuestionsSection } from "./InterviewQuestionsSection";
import { InterviewReflectionSection } from "./InterviewReflectionSection";
import { InterviewSelfReviewSection } from "./InterviewSelfReviewSection";

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
          <InterviewMetaFields
            companyName={companyName}
            format={format}
            stage={stage}
            date={date}
            asTemplate={asTemplate}
            companyOptions={companyOptions}
            onCompanyChange={setCompanyName}
            onFormatChange={setFormat}
            onStageChange={setStage}
            onDateChange={setDate}
            onTemplateToggle={handleTemplateToggle}
          />

          <InterviewQuestionsSection
            questions={questions}
            onChange={handleQAChange}
            onAdd={addQA}
            onRemove={removeQA}
          />

          <InterviewReflectionSection reflection={reflection} onChange={setReflection} />

          <InterviewSelfReviewSection value={selfReview} onChange={setSelfReview} />

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
