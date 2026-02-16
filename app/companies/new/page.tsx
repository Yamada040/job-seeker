import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, HomeIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

import { createCompany } from "../actions";
import { ROUTES } from "@/lib/constants/routes";
import { AppLayout } from "@/app/_components/layout";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { FormLengthGuard } from "@/app/_components/form-length-guard";
import { COMPANY_FIELDS, MAX_TEXT_LEN } from "@/app/_components/form-length-guard.config";

export default async function NewCompanyPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect(ROUTES.LOGIN);
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect(ROUTES.LOGIN);

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href={ROUTES.HOME} className="dq-button-secondary">
        <HomeIcon className="h-4 w-4" />
        MVPホーム
      </Link>
      <Link href={ROUTES.DASHBOARD} className="dq-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
      <Link href={ROUTES.COMPANIES} className="dq-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle="企業を追加"
      headerDescription="志望企業のカードを作成して進捗を管理"
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      <form
        id="company-form-new"
        action={createCompany}
        className="dq-card p-8"
      >
        <div className="space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">企業名</span>
            <input
              name="name"
              required
              className="dq-input text-sm"
              placeholder="例）Alpha SaaS"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">業界</span>
            <input
              name="industry"
              className="dq-input text-sm"
              placeholder="例）IT / コンサル / メーカー"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">URL</span>
            <input
              name="url"
              className="dq-input text-sm"
              placeholder="https://example.com"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">マイページID</span>
              <input
                name="mypage_id"
                className="dq-input text-sm"
                placeholder="ログインID"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">マイページURL</span>
              <input
                name="mypage_url"
                className="dq-input text-sm"
                placeholder="https://mypage.example.com"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">ステータス</span>
            <input
              name="stage"
              className="dq-input text-sm"
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
              className="dq-input text-sm"
              placeholder="3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">メモ</span>
            <textarea
              name="memo"
              rows={3}
              className="dq-input text-sm"
              placeholder="興味を持った理由、応募メモ、インターン日程など"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="favorite"
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
            />
            お気に入りに追加
          </label>
        </div>

        <div className="mt-6 flex justify-wrap gap-3">
          <button type="submit" className="dq-button">
            追加する
          </button>
          <Link href={ROUTES.COMPANIES} className="dq-button-secondary">
            キャンセル
          </Link>
        </div>
      </form>
      <FormLengthGuard formId="company-form-new" maxLen={MAX_TEXT_LEN} fields={COMPANY_FIELDS} />
    </AppLayout>
  );
}
