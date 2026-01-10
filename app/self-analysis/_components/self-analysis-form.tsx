"use client";

import { useMemo, useState } from "react";
import { AiPanel } from "@/app/_components/ai-panel";

type Answers = {
  strengths: string;
  values: string;
  motivation: string;
  successes: string;
  failures: string;
  workStyle: string;
  future: string;
};

const defaultAnswers: Answers = {
  strengths: "",
  values: "",
  motivation: "",
  successes: "",
  failures: "",
  workStyle: "",
  future: "",
};

const buildPrompt = (a: Answers) =>
  [
    `強み: ${a.strengths || "未記入"}`,
    `価値観: ${a.values || "未記入"}`,
    `モチベーション源泉: ${a.motivation || "未記入"}`,
    `成功体験: ${a.successes || "未記入"}`,
    `失敗体験・学び: ${a.failures || "未記入"}`,
    `働き方の好み: ${a.workStyle || "未記入"}`,
    `将来像（3-5年）: ${a.future || "未記入"}`,
  ].join("\n");

export default function SelfAnalysisForm({
  initialAnswers,
  initialSummary,
  initialResultId,
}: {
  initialAnswers: Record<string, unknown> | null;
  initialSummary: string | null;
  initialResultId: string | null;
}) {
  const [answers, setAnswers] = useState<Answers>(() => {
    if (initialAnswers) return { ...defaultAnswers, ...(initialAnswers as Partial<Answers>) };
    return defaultAnswers;
  });
  const [resultId, setResultId] = useState<string | null>(initialResultId);
  const prompt = useMemo(() => buildPrompt(answers), [answers]);
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);
  const [presetText, setPresetText] = useState<string>(() => buildPrompt(defaultAnswers));
  const [saving, setSaving] = useState(false);

  const handleRun = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/self-analysis/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const json = await res.json();
      if (!res.ok || !json?.id) {
        throw new Error(json?.error || "保存に失敗しました");
      }
      setResultId(json.id);
      setPresetText(prompt);
      setPresetKey(`${Date.now()}`);
    } catch (err) {
      alert("保存に失敗しました。もう一度お試しください。");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">質問リスト</h2>
        </div>
        <div className="mt-4 space-y-3">
          <TextArea label="強み・得意なこと" value={answers.strengths} onChange={(v) => handleChange("strengths", v)} />
          <TextArea
            label="価値観（仕事選びで譲れないこと）"
            value={answers.values}
            onChange={(v) => handleChange("values", v)}
          />
          <TextArea
            label="モチベーション源泉（燃える瞬間 / 冷める瞬間）"
            value={answers.motivation}
            onChange={(v) => handleChange("motivation", v)}
          />
          <TextArea
            label="成功体験（役割・結果・工夫）"
            value={answers.successes}
            onChange={(v) => handleChange("successes", v)}
          />
          <TextArea label="失敗体験・学び" value={answers.failures} onChange={(v) => handleChange("failures", v)} />
          <TextArea
            label="働き方の好み（リモート/出社、チーム/個人、裁量など）"
            value={answers.workStyle}
            onChange={(v) => handleChange("workStyle", v)}
          />
          <TextArea
            label="将来像（3-5年の仮のゴール）"
            value={answers.future}
            onChange={(v) => handleChange("future", v)}
          />
          <div className="flex flex-wrap gap-3">
            <button onClick={handleRun} disabled={saving} className="mvp-button mvp-button-primary">
              {saving ? "保存中..." : "保存する"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <AiPanel
          kind="self_analysis"
          defaultInput={prompt}
          presetText={presetText}
          presetKey={presetKey}
          cacheKey={resultId ? `self-analysis-${resultId}` : undefined}
          initialSummary={initialSummary ?? undefined}
          saveUrl="/api/ai/self-analysis"
          saveId={resultId ?? undefined}
          title="AI自己分析サマリー"
          hint="入力をもとに強み・価値観・モチベーションを整理します。保存すると再実行できません。"
        />
      </div>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
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
