import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUturnLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

import { AppLayout } from "@/app/_components/layout";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { createWebtestQuestion } from "../actions";
import { FormLengthGuard } from "@/app/_components/form-length-guard";
import { MAX_TEXT_LEN, WEBTEST_NEW_FIELDS } from "@/app/_components/form-length-guard.config";

export default async function WebtestNewPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect(ROUTES.LOGIN);
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect(ROUTES.LOGIN);

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href={ROUTES.WEBTESTS} className="mvp-button mvp-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
      <Link href={ROUTES.DASHBOARD} className="mvp-button mvp-button-secondary">
        <HomeIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
    </div>
  );

  return (
    <AppLayout headerTitle="Webテスト問題を追加" headerDescription="オリジナル問題を登録し、演習に使います" headerActions={headerActions}>
      <form
        id="webtest-form-new"
        action={createWebtestQuestion}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-md dark:border-slate-700 dark:bg-slate-900/80"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="title" label="タイトル" required placeholder="例）表の読み取り（売上推移）" />
          <Field name="category" label="カテゴリ" placeholder="非言語 / 言語 / 英語 など" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Field name="test_type" label="テスト形式" placeholder="SPI / 玉手箱 / TG-WEB など" />
          <Field name="format" label="形式" placeholder="表/グラフ/文章/計算 など" />
          <Field name="difficulty" label="難易度" placeholder="易 / 普通 / 難" />
          <Field name="time_limit" label="制限時間（秒）" placeholder="60" type="number" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
            問題文 <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="body"
            required
            rows={6}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="表や文章の内容を記載"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">選択肢（改行区切り）</label>
            <textarea
              name="choices"
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="A)\nB)\nC)\nD)"
            />
          </div>
          <Field name="answer" label="正解" required placeholder="例）C" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">解説（任意）</label>
          <textarea
            name="explanation"
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="解答の考え方や計算手順を記載"
          />
        </div>
        <div className="pt-2 flex justify-start">
          <button type="submit" className="mvp-button mvp-button-primary">
            保存する
          </button>
        </div>
      </form>
      <FormLengthGuard formId="webtest-form-new" maxLen={MAX_TEXT_LEN} fields={WEBTEST_NEW_FIELDS} />
    </AppLayout>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
    </label>
  );
}
