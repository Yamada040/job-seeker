"use client";

import { useMemo, useState } from "react";

type Question = { id: string; prompt: string; answer_md: string };

type Props = {
  initialQuestions: Question[];
};

const createQuestion = (): Question => ({
  id: crypto.randomUUID(),
  prompt: "",
  answer_md: "",
});

export function QuestionsEditor({ initialQuestions }: Props) {
  const [questions, setQuestions] = useState<Question[]>(() => (initialQuestions.length ? initialQuestions : [createQuestion()]));

  const handleChange = (id: string, key: keyof Question, value: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [key]: value } : q)));
  };

  const handleAdd = () => setQuestions((prev) => [...prev, createQuestion()]);

  const serialized = useMemo(() => JSON.stringify(questions), [questions]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>質問カード（必要に応じて追加できます）</span>
        <button type="button" onClick={handleAdd} className="mvp-button mvp-button-secondary">
          カードを追加
        </button>
      </div>

      <input type="hidden" name="questions_json" value={serialized} />

      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <label className="block space-y-1 text-xs text-slate-600">
              質問
              <input
                value={q.prompt}
                onChange={(e) => handleChange(q.id, "prompt", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="例: 学生時代に力を入れたこと"
              />
            </label>
            <label className="mt-2 block space-y-1 text-xs text-slate-600">
              回答 (Markdown可)
              <textarea
                value={q.answer_md}
                onChange={(e) => handleChange(q.id, "answer_md", e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="回答を入力"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
