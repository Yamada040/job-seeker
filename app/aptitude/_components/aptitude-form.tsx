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
  "人材/HR",
  "広告/マーケ/PR",
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
  "論理思考/問題解決",
  "データ分析",
  "コミュニケーション/折衝",
  "リーダーシップ/推進力",
  "探究心/学習意欲",
  "プロジェクトマネジメント",
  "クリエイティブ/企画",
  "技術/プログラミング",
  "営業力/交渉",
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
};

function buildPrompt(answers: Answers) {
  const lines = [
    `興味関心: ${answers.interests.join(", ") || "未選択"}`,
    `強み: ${answers.strengths.join(", ") || "未選択"}`,
    `価値観: ${answers.values.join(", ") || "未選択"}`,
    `楽しかった経験: ${answers.enjoy || "未記入"}`,
    `成果を出した経験: ${answers.achievements || "未記入"}`,
    `苦手/避けたいこと: ${answers.dislike || "未記入"}`,
    `働き方の希望: ${answers.workStyle || "未記入"}`,
    `希望勤務地/働き方: ${answers.location || "未記入"}`,
    `興味がある業界/領域: ${answers.industryWish || "未記入"}`,
    `興味がある職種: ${answers.roleWish || "未記入"}`,
    `その他メモ: ${answers.otherNotes || "未記入"}`,
  ];
  return lines.join("\n");
}

export default function AptitudeForm({ initialAnswers, initialSummary, initialResultId }: Props) {
  const [answers, setAnswers] = useState<Answers>(() => {
    if (initialAnswers) {
      return { ...defaultAnswers, ...(initialAnswers as Partial<Answers>) };
    }
    return defaultAnswers;
  });
  const [resultId, setResultId] = useState<string | null>(initialResultId);
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);
  const [presetText, setPresetText] = useState<string>(() => buildPrompt(defaultAnswers));
  const [savingAnswers, setSavingAnswers] = useState(false);

  const handleCheckboxToggle = (key: keyof Answers, value: string) => {
    setAnswers((prev) => {
      const current = new Set(prev[key] as string[]);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      return { ...prev, [key]: Array.from(current) };
    });
  };

  const handleInputChange = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const prompt = useMemo(() => buildPrompt(answers), [answers]);

  const handleDiagnose = async () => {
    setSavingAnswers(true);
    try {
      const res = await fetch("/api/aptitude/answers", {
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
      alert("保存に失敗しました。再度お試しください。");
      console.error(err);
    } finally {
      setSavingAnswers(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">適性チェック 質問</h2>
        </div>

        <div className="mt-4 space-y-4">
          <QuestionGroup title="興味がある分野（複数選択可）">
            <CheckboxGrid
              options={interestOptions}
              selected={answers.interests}
              onToggle={(v) => handleCheckboxToggle("interests", v)}
            />
          </QuestionGroup>

          <QuestionGroup title="強み（複数選択可）">
            <CheckboxGrid
              options={strengthOptions}
              selected={answers.strengths}
              onToggle={(v) => handleCheckboxToggle("strengths", v)}
            />
          </QuestionGroup>

          <QuestionGroup title="仕事で重視する価値観（複数選択可）">
            <CheckboxGrid
              options={valueOptions}
              selected={answers.values}
              onToggle={(v) => handleCheckboxToggle("values", v)}
            />
          </QuestionGroup>

          <TextArea
            label="これまで楽しかった経験/没頭したこと"
            value={answers.enjoy}
            onChange={(v) => handleInputChange("enjoy", v)}
          />
          <TextArea
            label="成果を出した経験（役割/結果/工夫など）"
            value={answers.achievements}
            onChange={(v) => handleInputChange("achievements", v)}
          />
          <TextArea
            label="苦手・避けたいこと"
            value={answers.dislike}
            onChange={(v) => handleInputChange("dislike", v)}
          />
          <TextArea
            label="働き方の希望（リモート/出社、チーム/個人、裁量など）"
            value={answers.workStyle}
            onChange={(v) => handleInputChange("workStyle", v)}
          />
          <TextArea
            label="希望勤務地・働き方"
            value={answers.location}
            onChange={(v) => handleInputChange("location", v)}
          />
          <TextArea
            label="興味がある業界/領域（あれば）"
            value={answers.industryWish}
            onChange={(v) => handleInputChange("industryWish", v)}
          />
          <TextArea
            label="興味がある職種（あれば）"
            value={answers.roleWish}
            onChange={(v) => handleInputChange("roleWish", v)}
          />
          <TextArea
            label="その他メモ"
            value={answers.otherNotes}
            onChange={(v) => handleInputChange("otherNotes", v)}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDiagnose}
              disabled={savingAnswers}
              className="mvp-button mvp-button-primary"
            >
              {savingAnswers ? "保存中..." : "AIに診断してもらう"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">診断結果</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">業界/職種の向き不向きを表示</p>
            </div>
          </div>
          <div className="mt-4">
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
              hint="質問への回答をもとに業界/職種の適性を診断します。保存すると再実行はできません。"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
      {children}
    </div>
  );
}

function CheckboxGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
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
