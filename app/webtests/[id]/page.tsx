import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, ArrowUturnLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

import { AppLayout } from "@/app/_components/layout";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { submitWebtestAnswer } from "../actions";

export default async function WebtestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const { data: question } = await supabase
    .from("webtest_questions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!question) return redirect("/webtests");

  const { data: attempts } = await supabase
    .from("webtest_attempts")
    .select("id,is_correct,time_spent,created_at")
    .eq("question_id", id)
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href="/webtests" className="mvp-button mvp-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
      <Link href="/dashboard" className="mvp-button mvp-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
      <Link href="/" className="mvp-button mvp-button-secondary">
        <HomeIcon className="h-4 w-4" />
        MVPホーム
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle={question.title}
      headerDescription="問題を解いて結果を記録します"
      headerActions={headerActions}
      className="space-y-6"
    >
      {status === "correct" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          正解です！
        </div>
      ) : status === "incorrect" ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">不正解です。もう一度チャレンジしましょう。</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-md dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
            <Badge label="テスト形式" value={question.test_type || "未設定"} />
            <Badge label="カテゴリ" value={question.category || "未設定"} />
            <Badge label="形式" value={question.format || "未設定"} />
            <Badge label="難易度" value={question.difficulty || "未設定"} />
            <Badge label="制限" value={question.time_limit ? `${question.time_limit}s` : "任意"} />
          </div>
          <p className="whitespace-pre-line text-sm leading-6 text-slate-900 dark:text-slate-100">{question.body}</p>

          <form action={submitWebtestAnswer.bind(null, id)} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">解答</label>
              {Array.isArray(question.choices) ? (
                <select
                  name="answer"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  required
                >
                  <option value="">選択してください</option>
                  {(question.choices as string[]).map((c, idx) => (
                    <option key={`${idx}-${c}`} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="answer"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="解答を入力"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-600 dark:text-slate-300">解答時間（秒） 任意</label>
              <input
                type="number"
                name="time_spent"
                min={0}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="60"
              />
            </div>
            <div className="pt-2 flex justify-start">
              <button type="submit" className="mvp-button mvp-button-primary">
                解答を送信
              </button>
            </div>
          </form>

          {question.explanation ? (
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">解説</p>
              <p className="mt-1 whitespace-pre-line leading-6">{question.explanation}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-md dark:border-slate-700 dark:bg-slate-900/80">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">最近の解答 (5件)</p>
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
            {(attempts ?? []).length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">まだ解答履歴がありません。</p>
            ) : (
              attempts!.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <span className={a.is_correct ? "text-emerald-600" : "text-rose-500"}>{a.is_correct ? "正解" : "不正解"}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {a.time_spent ? `${a.time_spent}s` : "-"} / {a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const Badge = ({ label, value }: { label: string; value: string }) => (
  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
    {label}: {value}
  </span>
);
