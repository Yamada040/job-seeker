import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon, ArrowUturnLeftIcon, HomeIcon, TrashIcon } from "@heroicons/react/24/outline";

import { updateCompany, deleteCompany } from "../actions";
import { ROUTES } from "@/lib/constants/routes";
import { CompanyAiPanel } from "../_components/company-ai-panel";
import { AppLayout } from "@/app/_components/layout";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect(ROUTES.LOGIN);
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect(ROUTES.LOGIN);

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error || !data) return notFound();

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href={ROUTES.HOME} className="mvp-button mvp-button-secondary">
        <HomeIcon className="h-4 w-4" />
        MVPホーム
      </Link>
      <Link href={ROUTES.DASHBOARD} className="mvp-button mvp-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
      <Link href={ROUTES.COMPANIES} className="mvp-button mvp-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
    </div>
  );

  const updateCompanyAction = updateCompany.bind(null, id);
  const deleteCompanyAction = deleteCompany.bind(null, id);

  return (
    <AppLayout
      headerTitle="企業カード編集"
      headerDescription="企業情報と選考ステータスを更新"
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <form action={updateCompanyAction} className="space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">企業名</span>
            <input
              name="name"
              defaultValue={data.name ?? ""}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="例）Alpha SaaS"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">業界</span>
            <input
              name="industry"
              defaultValue={data.industry ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="例）IT / コンサル / メーカー"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">URL</span>
            <input
              name="url"
              defaultValue={data.url ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="https://example.com"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">マイページID</span>
              <input
                name="mypage_id"
                defaultValue={data.mypage_id ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="ログインID"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">マイページURL</span>
              <input
                name="mypage_url"
                defaultValue={data.mypage_url ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="https://mypage.example.com"
              />
            </label>
          </div>

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
              defaultValue={data.preference ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">メモ</span>
            <textarea
              name="memo"
              rows={3}
              defaultValue={data.memo ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
              placeholder="興味を持った理由、応募メモ、インターン日程など"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="favorite"
              defaultChecked={data.favorite ?? false}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
            />
            お気に入りに追加
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="mvp-button mvp-button-primary">
              保存する
            </button>
            <Link href={ROUTES.COMPANIES} className="mvp-button mvp-button-secondary">
              キャンセル
            </Link>
          </div>
        </form>
      </div>
      <form action={deleteCompanyAction} className="flex justify-end">
        <button type="submit" className="mvp-button mvp-button-secondary text-rose-600">
          <TrashIcon className="h-4 w-4" />
          削除する
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <CompanyAiPanel
          name={data.name}
          url={data.url}
          stage={data.stage}
          preference={data.preference}
          memo={data.memo}
          cacheKey={`company-${id}`}
          initialSummary={data.ai_summary}
          saveId={id}
          saveUrl="/api/ai/company"
        />
      </div>
    </AppLayout>
  );
}
