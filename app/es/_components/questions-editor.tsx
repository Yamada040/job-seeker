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
  const handleRemove = (id: string) => setQuestions((prev) => (prev.length > 1 ? prev.filter((q) => q.id !== id) : prev));

  // 並び順を固定した文字列として hidden input に入れる
  const serialized = useMemo(() => JSON.stringify(questions), [questions]);

  return (
    <div className="space-y-3">
      <input type="hidden" name="questions_json" value={serialized} />
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-200/80">質問と回答（自由に追加・削除できます）</p>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10"
        >
          + 質問を追加
        </button>
      </div>
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={q.id} className="space-y-3 rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between text-xs text-slate-200/80">
              <span>質問 {idx + 1}</span>
              {questions.length > 1 ? (
                <button
                  type="button"
                  onClick={() => handleRemove(q.id)}
                  className="rounded-full border border-white/20 px-2 py-1 text-[11px] text-white hover:bg-white/10"
                >
                  削除
                </button>
              ) : null}
            </div>
            <label className="block space-y-1 text-xs text-slate-200/80">
              質問
              <input
                value={q.prompt}
                onChange={(e) => handleChange(q.id, "prompt", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
                placeholder="例: ガクチカで取り組んだテーマは？"
              />
            </label>
            <label className="block space-y-1 text-xs text-slate-200/80">
              回答（Markdown）
              <textarea
                value={q.answer_md}
                onChange={(e) => handleChange(q.id, "answer_md", e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
                placeholder="ここに回答を入力"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
