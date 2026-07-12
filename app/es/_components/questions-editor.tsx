"use client";

import { useMemo, useState } from "react";

type Question = { id: string; prompt: string; answer_md: string };

type Props = {
  initialQuestions: Question[];
  readOnly?: boolean;
};

const createQuestion = (): Question => ({
  id: crypto.randomUUID(),
  prompt: "",
  answer_md: "",
});

export function QuestionsEditor({ initialQuestions, readOnly = false }: Props) {
  const [questions, setQuestions] = useState<Question[]>(() =>
    initialQuestions.length ? initialQuestions : [createQuestion()],
  );

  const handleChange = (id: string, key: keyof Question, value: string) => {
    if (readOnly) return;
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [key]: value } : q)));
  };

  const handleAdd = () => {
    if (readOnly) return;
    setQuestions((prev) => [...prev, createQuestion()]);
  };

  const handleRemove = (id: string) => {
    if (readOnly) return;
    setQuestions((prev) => {
      const next = prev.filter((q) => q.id !== id);
      return next.length ? next : [createQuestion()];
    });
  };

  const serialized = useMemo(() => JSON.stringify(questions), [questions]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>質問カード（必要に応じて追加できます）</span>
        {!readOnly && (
          <button type="button" onClick={handleAdd} className="sidebar-link-style text-sm">
            カードを追加
          </button>
        )}
      </div>

      <input type="hidden" name="questions_json" value={serialized} />

      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className="rounded-xl border border-[#3f3f46] bg-[#111111] px-4 py-3">
            <label className="block space-y-1 text-xs text-white/70">
              質問
              <input
                value={q.prompt}
                onChange={(e) => handleChange(q.id, "prompt", e.target.value)}
                className="dq-input text-sm"
                placeholder="例） 学生時代に力を入れたこと"
                disabled={readOnly}
              />
            </label>
            <label className="mt-2 block space-y-1 text-xs text-white/70">
              回答
              <textarea
                value={q.answer_md}
                onChange={(e) => handleChange(q.id, "answer_md", e.target.value)}
                rows={5}
                className="dq-input text-sm"
                placeholder="回答を入力"
                disabled={readOnly}
              />
            </label>
            {!readOnly && (
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={() => handleRemove(q.id)} className="sidebar-link-style text-xs">
                  削除
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
