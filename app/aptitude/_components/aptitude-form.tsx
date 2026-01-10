"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { AiPanel } from "@/app/_components/ai-panel";
import { ROUTES } from "@/lib/constants/routes";
import { Answers } from "../types";
import { CheckboxGroup, SelectBox, TextArea } from "./aptitude-fields";
import {
  defaultAnswers,
  interestOptions,
  mbtiOptions,
  strengthOptions,
  valueOptions,
} from "./aptitude-constants";
import { buildPrompt } from "./aptitude-utils";

type Props = {
  initialAnswers: Record<string, unknown> | null;
  initialSummary: string | null;
  initialResultId: string | null;
};


export default function AptitudeForm({ initialAnswers, initialSummary, initialResultId }: Props) {
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
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">適性チェック</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">興味・強み・価値観を整理してAI診断へ送信</p>
          </div>
          <Link href={ROUTES.COMPANIES} className="mvp-button mvp-button-secondary">
            企業一覧へ
          </Link>
        </div>

        <div className="mt-4 space-y-4">
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
          <TextArea label="好きな業務/没頭できること" value={answers.enjoy} onChange={(v) => handleChange("enjoy", v)} />
          <TextArea label="誇りに思う達成" value={answers.achievements} onChange={(v) => handleChange("achievements", v)} />
          <TextArea label="苦手・避けたいこと" value={answers.dislike} onChange={(v) => handleChange("dislike", v)} />
          <TextArea label="働き方の希望（例: リモート中心、出社多め）" value={answers.workStyle} onChange={(v) => handleChange("workStyle", v)} />
          <TextArea label="希望勤務地/働き方" value={answers.location} onChange={(v) => handleChange("location", v)} />
          <TextArea label="興味のある業界" value={answers.industryWish} onChange={(v) => handleChange("industryWish", v)} />
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
            <button onClick={handleSaveAnswers} disabled={saving} className="mvp-button mvp-button-primary">
              {saving ? "保存中..." : "保存する"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
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
