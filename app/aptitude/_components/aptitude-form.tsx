"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { AiPanel } from "@/app/_components/ai-panel";

type Answers = {
  interests: string[];
  strengths: string[];
  values: string[];
  enjoy: string;
  achievements: string;
  dislike: string;
  workStyle: string;
  location: string;
  industryWish: string;
  roleWish: string;
  otherNotes: string;
  mbti: string;
};

type Props = {
  initialAnswers: Record<string, unknown> | null;
  initialSummary: string | null;
  initialResultId: string | null;
};

const interestOptions = [
  "SaaS/プロダクト開発",
  "コンサルティング",
  "金融/Fintech",
  "人事/HR",
  "マーケ/PR",
  "メディア/コンテンツ",
  "ヘルスケア/医療",
  "ゲーム/エンタメ",
  "公共/教育",
  "製造/モノづくり",
  "物流/EC",
  "スタートアップ/新規事業",
  "グローバル/海外",
];

const strengthOptions = [
  "論理思考・問題解決",
  "チーム牽引",
  "コミュニケーション/折衝",
  "リーダーシップ/推進力",
  "探究心・学習意欲",
  "プロジェクトマネジメント",
  "クリエイティブ/企画",
  "技術・プログラミング",
  "営業力・交渉力",
  "語学/異文化対応",
];

const valueOptions = [
  "裁量・意思決定",
  "安定性",
  "社会貢献/インパクト",
  "報酬",
  "成長スピード",
  "ワークライフバランス",
  "リモート/柔軟性",
  "チームワーク",
  "専門性の深化",
  "グローバル環境",
];

const mbtiOptions = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
];

const defaultAnswers: Answers = {
  interests: [],
  strengths: [],
  values: [],
  enjoy: "",
  achievements: "",
  dislike: "",
  workStyle: "",
  location: "",
  industryWish: "",
  roleWish: "",
  otherNotes: "",
  mbti: "",
};

const buildPrompt = (a: Answers) =>
  [
    `興味のある領域: ${a.interests.join(", ") || "未選択"}`,
    `強み: ${a.strengths.join(", ") || "未選択"}`,
    `価値観: ${a.values.join(", ") || "未選択"}`,
    `好きな業務/没頭できること: ${a.enjoy || "未記入"}`,
    `誇りに思う達成: ${a.achievements || "未記入"}`,
    `苦手・避けたいこと: ${a.dislike || "未記入"}`,
    `働き方の希望: ${a.workStyle || "未記入"}`,
    `希望勤務地/働き方: ${a.location || "未記入"}`,
    `興味のある業界: ${a.industryWish || "未記入"}`,
    `興味のある職種: ${a.roleWish || "未記入"}`,
    `MBTI: ${a.mbti || "未記入"}`,
    `補足メモ: ${a.otherNotes || "未記入"}`,
  ].join("\n");

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
          <Link href="/companies" className="mvp-button mvp-button-secondary">
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
