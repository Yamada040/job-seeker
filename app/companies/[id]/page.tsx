import Link from "next/link";
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

import { deleteCompany, updateCompany } from "../actions";
import { AiPanel } from "@/app/_components/ai-panel";
import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import { AppLayout } from "@/app/_components/layout";

type Props = { params: { id: string } };

const STAGE_OPTIONS = ["未エントリー", "書類提出", "面接中", "内定", "辞退"];

export default async function CompanyDetailPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);

  const supabase = await createSupabaseReadonlyClient();
  const { data: userData } = supabase ? await supabase.auth.getUser() : { data: null };

  const { data, error } =
    supabase && userData?.user
      ? await supabase
          .from("companies")
          .select("*")
          .eq("id", resolvedParams.id)
          .eq("user_id", userData.user.id)
          .maybeSingle()
      : { data: null, error: null };

  const fallback = {
    id: resolvedParams.id,
    user_id: userData?.user?.id ?? "guest",
    name: "サンプル企業",
    url: "https://example.com",
    memo: "ここにメモを追加してください。",
    stage: "未エントリー",
    preference: 3,
    favorite: false,
    ai_summary: null,
    created_at: null,
    updated_at: null,
  } as const;

  const company = data ?? fallback;
  const loadError = Boolean(error || !data);
  const canEdit = Boolean(userData?.user);

  const handleUpdate = async (formData: FormData) => {
    "use server";
    await updateCompany(resolvedParams.id, formData);
  };

  const headerActions = (
    <div className="flex gap-3">
      <Link href="/companies" className="mvp-button mvp-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
      {canEdit && (
        <form action={deleteCompany.bind(null, resolvedParams.id)} className="inline">
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
      headerTitle={company.name}
      headerDescription={`企業情報の編集・AI分析 ${loadError ? "(サンプル表示中)" : ""}`}
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      {/* Main Form */}
      <form action={handleUpdate} className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-md backdrop-blur">
        <div className="space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">企業名</span>
            <input
              name="name"
              defaultValue={company.name}
              required
              disabled={!canEdit}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">URL</span>
            <input
              name="url"
              defaultValue={company.url ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
              placeholder="https://example.com"
            />
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">ステータス</span>
              <select
                name="stage"
                defaultValue={company.stage ?? "未エントリー"}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
              >
                {STAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">志望度（1-5）</span>
              <input
                name="preference"
                type="number"
                min={1}
                max={5}
                defaultValue={company.preference ?? 3}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">メモ</span>
            <textarea
              name="memo"
              rows={4}
              defaultValue={company.memo ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input 
              type="checkbox" 
              name="favorite" 
              defaultChecked={Boolean(company.favorite)} 
              className="h-4 w-4 rounded border-slate-300 bg-slate-50" 
              disabled={!canEdit} 
            />
            お気に入りにする
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href="/companies" className="mvp-button mvp-button-secondary">
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
        <AiPanel
          kind="company_analysis"
          defaultInput={`${company.name} ${company.url ?? ""}`}
          title="AI企業分析を試す"
          hint="Gemini/GPTは環境変数で切り替え。lib/ai/client.ts で実APIを呼び出しています。"
        />
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
