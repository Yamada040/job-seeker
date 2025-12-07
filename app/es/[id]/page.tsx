import Link from "next/link";

import { updateEs, deleteEs } from "../actions";
import { EsAiPanel } from "../_components/ai-es-panel";
import { QuestionsEditor } from "../_components/questions-editor";
import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";

type Props = { params: { id: string } };

type Question = { id: string; prompt: string; answer_md: string };

const STATUS_OPTIONS = ["下書き", "提出済", "添削済"];

export default async function EsDetailPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);

  const supabase = await createSupabaseReadonlyClient();
  const { data: userData } = supabase ? await supabase.auth.getUser() : { data: null };

  const { data, error } =
    supabase && userData?.user
      ? await supabase
          .from("es_entries")
          .select("*")
          .eq("id", resolvedParams.id)
          .eq("user_id", userData.user.id)
          .maybeSingle()
      : { data: null, error: null };

  const fallback = {
    id: resolvedParams.id,
    user_id: userData?.user?.id ?? "guest",
    title: "サンプルES",
    content_md: "ここにES本文を入力してください。",
    status: "下書き",
    tags: ["サンプル"],
    score: null,
    questions: [],
    created_at: null,
    updated_at: null,
  } as const;

  const es = data ?? fallback;
  const loadError = Boolean(error || !data);
  const canEdit = Boolean(userData?.user);

  const rawQuestions = (es as { questions?: unknown }).questions;
  const questions: Question[] = Array.isArray(rawQuestions)
    ? rawQuestions.map((q) => {
        const item = q as Partial<Question>;
        return {
          id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
          prompt: typeof item.prompt === "string" ? item.prompt : "",
          answer_md: typeof item.answer_md === "string" ? item.answer_md : "",
        };
      })
    : [];

  const combinedContent =
    questions.length > 0
      ? questions
          .map((q) => `${q.prompt}\n${q.answer_md}`.trim())
          .filter(Boolean)
          .join("\n\n")
      : es.content_md ?? "";

  const handleUpdate = async (formData: FormData) => {
    "use server";
    await updateEs(resolvedParams.id, formData);
  };

  const headerActions = (
    <div className="flex gap-3">
      <Link href="/es" className="mvp-button mvp-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
      {canEdit && (
        <form action={deleteEs.bind(null, resolvedParams.id)} className="inline">
          <button
            type="submit"
            className="mvp-button mvp-button-secondary text-red-600 hover:bg-red-50"
            onClick={(e) => {
              if (!confirm("本当に削除しますか？")) {
                e.preventDefault();
              }
            }}
          >
            <TrashIcon className="h-4 w-4" />
            削除
          </button>
        </form>
      )}
    </div>
  );

  return (
    <AppLayout 
      headerTitle={es.title}
      headerDescription={`ESの編集・AI添削 ${loadError ? "(サンプル表示中)" : ""}`}
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >

      {/* Main Form */}
      <form action={handleUpdate} className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-md backdrop-blur">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">タイトル</span>
              <input
                name="title"
                defaultValue={es.title}
                required
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">ステータス</span>
              <select
                name="status"
                defaultValue={es.status ?? "下書き"}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">タグ（カンマ区切り）</span>
            <input
              name="tags"
              defaultValue={(es.tags ?? []).join(", ")}
              disabled={!canEdit}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
              placeholder="SaaS, インターン, 志望度高"
            />
          </label>

          <div className="space-y-3">
            <QuestionsEditor initialQuestions={questions} />
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">全体メモ（任意、AI送信時にも使われます）</span>
            <textarea
              name="content_md"
              rows={4}
              defaultValue={es.content_md ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
            />
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href="/es" className="mvp-button mvp-button-secondary">
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={!canEdit}
              className="mvp-button mvp-button-primary disabled:opacity-60"
            >
              <PencilSquareIcon className="h-4 w-4" />
              保存
            </button>
          </div>
        </div>
      </form>

      {/* AI Panel */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-md backdrop-blur">
        <EsAiPanel content={combinedContent} />
      </div>

      {/* Status Notice */}
      {!canEdit && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-soft">
          デモ表示中です。ログインすると保存・削除が有効になります。
        </div>
      )}
    </AppLayout>
  );
}
