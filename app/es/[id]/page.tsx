import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, HomeIcon, ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import { AppLayout } from "@/app/_components/layout";
import { QuestionsEditor } from "../_components/questions-editor";
import { EsAiPanel } from "../_components/ai-es-panel";
import { deleteEs, updateEs } from "../actions";

type Question = { id: string; prompt: string; answer_md: string };

function parseQuestions(questions: unknown): Question[] {
  if (!questions) return [];
  if (Array.isArray(questions)) {
    return questions.map((q) => ({
      id: typeof q.id === "string" ? q.id : crypto.randomUUID(),
      prompt: typeof q.prompt === "string" ? q.prompt : "",
      answer_md: typeof q.answer_md === "string" ? q.answer_md : "",
    }));
  }
  return [];
}

export default async function EsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseReadonlyClient();
  const { data: userData } = await supabase?.auth.getUser();
  const userId = userData?.user?.id ?? null;

  if (!userId) return redirect("/login");

  const { data, error } = await supabase.from("es_entries").select("*").eq("id", id).eq("user_id", userId).maybeSingle();

  if (error || !data) {
    return redirect("/es");
  }

  const questions = parseQuestions(data.questions);
  const combinedContent =
    questions.length > 0
      ? questions
          .map((q) => [q.prompt?.trim(), q.answer_md?.trim()].filter(Boolean).join("\n"))
          .filter(Boolean)
          .join("\n\n")
      : data.content_md ?? "";

  const handleUpdate = updateEs.bind(null, id);
  const handleDelete = deleteEs.bind(null, id);

  return (
    <AppLayout
      headerTitle="ES詳細"
      headerDescription="質問カードを編集してAI添削へ"
      headerActions={
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="mvp-button mvp-button-secondary">
            <HomeIcon className="h-4 w-4" />
            MVPホーム
          </Link>
          <Link href="/dashboard" className="mvp-button mvp-button-secondary">
            <ArrowUturnLeftIcon className="h-4 w-4" />
            ダッシュボード
          </Link>
          <Link href="/es" className="mvp-button mvp-button-secondary">
            <ArrowLeftIcon className="h-4 w-4" />
            一覧へ戻る
          </Link>
        </div>
      }
      className="flex flex-col gap-8"
    >
      <div className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
        <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur">
          <form action={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs text-slate-600">タイトル*</label>
              <input
                name="title"
                defaultValue={data.title ?? ""}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1 text-xs text-slate-600">
                ステータス
                <select
                  name="status"
                  defaultValue={data.status ?? "draft"}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                >
                  <option value="draft">下書き</option>
                  <option value="submitted">提出済</option>
                  <option value="reviewed">添削済</option>
                  <option value="done">完了</option>
                </select>
              </label>
              <label className="block space-y-1 text-xs text-slate-600">
                タグ（カンマ区切り）
                <input
                  name="tags"
                  defaultValue={(data.tags ?? []).join(", ")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                  placeholder="SaaS, プロダクト, 夏インターン"
                />
              </label>
            </div>

            <QuestionsEditor initialQuestions={questions.length ? questions : [{ id: crypto.randomUUID(), prompt: "自己PR", answer_md: data.content_md ?? "" }]} />

            <div className="flex justify-between gap-3">
              <button type="submit" className="mvp-button mvp-button-primary">
                保存する
              </button>
              <button formAction={handleDelete} className="mvp-button mvp-button-secondary text-red-600">
                <TrashIcon className="h-4 w-4" />
                削除
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur">
          <EsAiPanel content={combinedContent} />
        </div>
      </div>
    </AppLayout>
  );
}
