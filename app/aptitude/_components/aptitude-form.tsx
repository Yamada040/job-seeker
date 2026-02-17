"use client";

import { useMemo, useState } from "react";

import { AiPanel } from "@/app/_components/ai-panel";
import { Answers } from "../types";
import { defaultAnswers, interestOptions, mbtiOptions, strengthOptions, valueOptions } from "./aptitude-constants";
import { buildPrompt } from "./aptitude-utils";

type Props = {
  initialAnswers: Record<string, unknown> | null;
  initialSummary: string | null;
  initialResultId: string | null;
  isMonthlyLocked: boolean;
};

export default function AptitudeForm({ initialAnswers, initialSummary, initialResultId, isMonthlyLocked }: Props) {
  const [answers, setAnswers] = useState<Answers>(() => {
    if (initialAnswers) return { ...defaultAnswers, ...(initialAnswers as Partial<Answers>) };
    return defaultAnswers;
  });
  const [resultId, setResultId] = useState<string | null>(initialResultId);
  const prompt = useMemo(() => buildPrompt(answers), [answers]);
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);
  const [presetText, setPresetText] = useState<string>(() => buildPrompt(defaultAnswers));
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof Pick<Answers, "interests" | "strengths" | "values">, value: string) => {
    setAnswers((prev) => {
      const list = new Set(prev[key]);
      if (list.has(value)) {
        list.delete(value);
      } else {
        list.add(value);
      }
      return { ...prev, [key]: Array.from(list) } as Answers;
    });
  };

  const handleChange = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAnswers = async () => {
    if (isMonthlyLocked) {
      alert("適性チェックは現在一回しかできません。");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/aptitude/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const json = await res.json();
      if (!res.ok || !json?.id) throw new Error(json?.error || "保存に失敗しました");
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <div className="dq-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="theme-readable text-lg font-semibold">質問リスト</h2>
        </div>

        <div className="mt-4 space-y-4">
          <div className="dq-panel px-3 py-2 text-xs font-semibold text-yellow-200">
            ※ 現在は一回しかできません。
          </div>
          <CheckboxGroup
            label="興味のある領域（複数選択可）"
            options={interestOptions}
            selected={answers.interests}
            onToggle={(v) => toggle("interests", v)}
          />
          <CheckboxGroup
            label="強み（複数選択可）"
            options={strengthOptions}
            selected={answers.strengths}
            onToggle={(v) => toggle("strengths", v)}
          />
          <CheckboxGroup
            label="価値観（複数選択可）"
            options={valueOptions}
            selected={answers.values}
            onToggle={(v) => toggle("values", v)}
          />
          <TextArea
            label="好きな業務/没頭できること"
            value={answers.enjoy}
            onChange={(v) => handleChange("enjoy", v)}
          />
          <TextArea
            label="誇りに思う達成"
            value={answers.achievements}
            onChange={(v) => handleChange("achievements", v)}
          />
          <TextArea label="苦手・避けたいこと" value={answers.dislike} onChange={(v) => handleChange("dislike", v)} />
          <TextArea
            label="働き方の希望（例: リモート中心、出社多め）"
            value={answers.workStyle}
            onChange={(v) => handleChange("workStyle", v)}
          />
          <TextArea label="希望勤務地/働き方" value={answers.location} onChange={(v) => handleChange("location", v)} />
          <TextArea
            label="興味のある業界"
            value={answers.industryWish}
            onChange={(v) => handleChange("industryWish", v)}
          />
          <TextArea label="興味のある職種" value={answers.roleWish} onChange={(v) => handleChange("roleWish", v)} />
          <SelectBox
            label="MBTIタイプ（任意）"
            value={answers.mbti}
            onChange={(v) => handleChange("mbti", v)}
            options={mbtiOptions}
            placeholder="選択してください"
          />
          <TextArea label="補足メモ" value={answers.otherNotes} onChange={(v) => handleChange("otherNotes", v)} />
          <div className="flex flex-wrap gap-3">
            <button onClick={handleSaveAnswers} disabled={saving || isMonthlyLocked} className="dq-button disabled:cursor-not-allowed disabled:opacity-60">
              {isMonthlyLocked ? "実施済み" : saving ? "保存中..." : "保存する"}
            </button>
          </div>
        </div>
      </div>

      <div className="dq-card p-5">
        <AiPanel
          kind="aptitude_analysis"
          defaultInput={prompt}
          presetText={presetText}
          presetKey={presetKey}
          cacheKey={resultId ? `aptitude-${resultId}` : undefined}
          initialSummary={initialSummary ?? undefined}
          saveUrl="/api/ai/aptitude"
          saveId={resultId ?? undefined}
          title="AI適性診断"
          hint="保存後は再実行できません。入力内容を確認して送信してください。"
        />
      </div>
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="theme-readable text-sm font-semibold">{label}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="dq-panel flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-white transition hover:text-yellow-400"
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

function SelectBox({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="theme-readable text-sm font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="dq-input text-sm"
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
