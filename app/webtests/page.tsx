import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUturnLeftIcon, HomeIcon, PlusIcon } from "@heroicons/react/24/outline";

import { AppLayout } from "@/app/_components/layout";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";

type WebtestListItem = {
  id: string;
  title: string;
  test_type: string | null;
  category: string | null;
  format: string | null;
  difficulty: string | null;
  time_limit: number | null;
  created_at: string | null;
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function WebtestsPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect(ROUTES.LOGIN);
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect(ROUTES.LOGIN);

  const params = await searchParams;
  const testTypeParam = params?.test_type;
  let testTypeFilter: string | undefined;
  if (Array.isArray(testTypeParam)) {
    testTypeFilter = testTypeParam[0];
  } else if (typeof testTypeParam === "string") {
    testTypeFilter = testTypeParam;
  }

  const query = supabase
    .from("webtest_questions")
    .select("id, title, test_type, category, format, difficulty, time_limit, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (testTypeFilter) {
    query.eq("test_type", testTypeFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = (data ?? []) as WebtestListItem[];
  const testTypeOptions = Array.from(new Set(items.map((q) => q.test_type).filter(Boolean))) as string[];

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href={ROUTES.DASHBOARD} className="dq-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
      <Link href={ROUTES.HOME} className="dq-button-secondary">
        <HomeIcon className="h-4 w-4" />
        MVPホーム
      </Link>
      <Link href={ROUTES.WEBTESTS_NEW} className="dq-button">
        <PlusIcon className="h-4 w-4" />
        問題を追加
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle="Webテスト対策（問題バンク）"
      headerDescription="オリジナル問題を登録・一覧表示して演習に備えます"
      headerActions={headerActions}
      className="space-y-6"
    >
      <div className="dq-card space-y-4 p-4">
        <div className="flex flex-wrap gap-3 text-sm">
          <form
            className="dq-panel flex items-center gap-2 px-3 py-2"
            method="GET"
            action={ROUTES.WEBTESTS}
          >
            <span className="text-xs text-white/60">テスト形式</span>
            <select
              name="test_type"
              defaultValue={testTypeFilter ?? ""}
              className="bg-transparent text-sm outline-none"
            >
              <option value="">すべて</option>
              {testTypeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-full border border-white/30 px-2 py-1 text-xs text-white/80 hover:text-yellow-400"
            >
              絞り込む
            </button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm text-white">
            <thead className="bg-black/60">
              <tr>
                <Th>タイトル</Th>
                <Th>テスト形式</Th>
                <Th>カテゴリ</Th>
                <Th>形式</Th>
                <Th>難易度</Th>
                <Th>時間(秒)</Th>
                <Th>作成日</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-white/60">
                    まだ問題がありません。右上の「問題を追加」から登録してください。
                  </td>
                </tr>
              ) : (
                items.map((q) => (
                  <tr key={q.id} className="hover:bg-white/5">
                    <Td>
                      <Link href={ROUTES.WEBTEST_DETAIL(q.id)} className="font-semibold text-yellow-200 hover:underline">
                        {q.title}
                      </Link>
                    </Td>
                    <Td>{q.test_type || "-"}</Td>
                    <Td>{q.category || "-"}</Td>
                    <Td>{q.format || "-"}</Td>
                    <Td>{q.difficulty || "-"}</Td>
                    <Td>{q.time_limit ?? "-"}</Td>
                    <Td>{q.created_at ? new Date(q.created_at).toLocaleDateString() : "-"}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/70">{children}</th>
);
const Td = ({ children }: { children: React.ReactNode }) => <td className="px-4 py-3 align-top text-white/90">{children}</td>;
