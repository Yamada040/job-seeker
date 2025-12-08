import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon, HomeIcon, ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import { AppLayout } from "@/app/_components/layout";
import { updateCompany, deleteCompany } from "../actions";

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");
  const { data, error } = await supabase.from("companies").select("*").eq("id", params.id).eq("user_id", userData.user.id).maybeSingle();

  if (error || !data) return notFound();

  const handleUpdate = updateCompany.bind(null, params.id);
  const handleDelete = deleteCompany.bind(null, params.id);

  return (
    <AppLayout
      headerTitle="企業詳細"
      headerDescription="志望企業の情報を編集"
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
          <Link href="/companies" className="mvp-button mvp-button-secondary">
            <ArrowLeftIcon className="h-4 w-4" />
            一覧へ戻る
          </Link>
        </div>
      }
      className="flex flex-col gap-8"
    >
      <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <form action={handleUpdate} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">企業名*</span>
              <input
                name="name"
                defaultValue={data.name ?? ""}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">URL</span>
              <input
                name="url"
                defaultValue={data.url ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">ステータス</span>
              <input
                name="stage"
                defaultValue={data.stage ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="Screening / Document passed など"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">志望度（1-5）</span>
              <input
                name="preference"
                type="number"
                min="1"
                max="5"
                defaultValue={data.preference ?? 3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">メモ</span>
            <textarea
              name="memo"
              rows={4}
              defaultValue={data.memo ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="志望理由や気になる点をメモ"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="favorite"
              defaultChecked={Boolean(data.favorite)}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
            />
            お気に入りにする
          </label>

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
    </AppLayout>
  );
}
