import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, HomeIcon, ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
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
  if (!supabase) throw new Error("Supabase client unavailable");
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  if (!userId) return redirect("/login");

  const { data, error } = await supabase
    .from("es_entries")
    .select("*, ai_summary")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

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
      headerDescription="ESを編集して保存し、AI添削パネルで確認できます。"
      headerActions={
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="mvp-button mvp-button-secondary">
            <HomeIcon className="h-4 w-4" />
            MVPへ
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
        <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
          <form action={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs text-slate-600">企業名</label>
              <input
                name="company_name"
                defaultValue={data.company_name ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="例: Alpha SaaS"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-slate-600">ESタイトル*</label>
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
                  <option value="submitted">提出済み</option>
                  <option value="reviewed">添削済み</option>
                  <option value="done">完了</option>
                </select>
              </label>
              <label className="block space-y-1 text-xs text-slate-600">
                タグ（カンマ区切り）
                <input
                  name="tags"
                  defaultValue={(data.tags ?? []).join(", ")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                  placeholder="SaaS, Webサービス, 本選考"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block space-y-1 text-xs text-slate-600">
                選考ステータス
                <input
                  name="selection_status"
                  defaultValue={data.selection_status ?? ""}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                  placeholder="書類提出 / 面接 / 最終面接"
                />
              </label>
              <label className="block space-y-1 text-xs text-slate-600">
                企業ホームページURL
                <input
                  name="company_url"
                  defaultValue={data.company_url ?? ""}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                  placeholder="https://example.com"
                />
              </label>
              <label className="block space-y-1 text-xs text-slate-600">
                メモ
                <input
                  name="memo"
                  defaultValue={data.memo ?? ""}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
                  placeholder="選考メモや補足など"
                />
              </label>
              <label className="block space-y-1 text-xs text-slate-600">
                応募締切（日付）
                <input
                  type="date"
                  name="deadline"
                  defaultValue={data.deadline ?? ""}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300"
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

        <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
          <EsAiPanel
            content={combinedContent}
            cacheKey={data.id}
            initialSummary={data.ai_summary}
            saveUrl="/api/es-ai-save"
            saveId={data.id}
            defaultCompanyName={data.company_name ?? ""}
            defaultStatus={data.selection_status ?? data.status ?? ""}
            defaultCompanyUrl={data.company_url ?? data.tags?.find((t: string) => t.startsWith("http")) ?? ""}
            defaultTitle={data.title ?? ""}
          />
        </div>
      </div>
    </AppLayout>
  );
}
