"use client";

import { useActionState, useMemo, useState } from "react";
import { AiPanel } from "@/app/_components/ai-panel";
import { notifyXpUpdated } from "@/lib/xp/level-up-signal";

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
  isMonthlyLocked,
}: {
  initialAnswers: Record<string, unknown> | null;
  initialSummary: string | null;
  initialResultId: string | null;
  isMonthlyLocked: boolean;
}) {
  const [answers, setAnswers] = useState<Answers>(() => {
    if (initialAnswers) return { ...defaultAnswers, ...(initialAnswers as Partial<Answers>) };
    return defaultAnswers;
  });
  const [resultId, setResultId] = useState<string | null>(initialResultId);
  const prompt = useMemo(() => buildPrompt(answers), [answers]);
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);
  const [presetText, setPresetText] = useState<string>(() => buildPrompt(defaultAnswers));

  const [, saveAction, saving] = useActionState<null, FormData>(async () => {
    if (isMonthlyLocked) {
      alert("自己分析は現在一回しかできません。");
      return null;
    }
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
      notifyXpUpdated();
      setResultId(json.id);
      setPresetText(prompt);
      setPresetKey(`${Date.now()}`);
    } catch (err) {
      alert("保存に失敗しました。もう一度お試しください。");
      console.error(err);
    }
    return null;
  }, null);

  const handleChange = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <div className="dq-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="theme-readable text-lg font-semibold">質問リスト</h2>
        </div>
        <div className="mt-4 space-y-3">
          <div className="dq-panel px-3 py-2 text-xs font-semibold text-yellow-200">
            ※ 現在は一回しかできません。
          </div>
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
          <form action={saveAction} className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving || isMonthlyLocked} className="dq-button disabled:cursor-not-allowed disabled:opacity-60">
              {isMonthlyLocked ? "実施済み" : saving ? "保存中..." : "保存する"}
            </button>
          </form>
        </div>
      </div>

      <div className="dq-card p-5">
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

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-2">
      <span className="theme-readable text-sm font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="dq-input text-sm"
      />
    </label>
  );
}
