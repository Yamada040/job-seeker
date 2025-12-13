import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUturnLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

import { AppLayout } from "@/app/_components/layout";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import InterviewForm from "../_components/interview-form";

export default async function InterviewNewPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const { data: companies } = await supabase.from("companies").select("name").eq("user_id", userData.user.id).order("created_at", { ascending: false });
  const companyOptions =
    companies?.filter((c) => c.name).map((c) => ({ value: c.name as string, label: c.name as string })) ?? [];

  const headerActions = (
    <div className="flex flex-wrap gap-3">
      <Link href="/interviews" className="mvp-button mvp-button-secondary">
        <ArrowUturnLeftIcon className="h-4 w-4" />
        一覧へ戻る
      </Link>
      <Link href="/dashboard" className="mvp-button mvp-button-secondary">
        <HomeIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
    </div>
  );

  return (
    <AppLayout headerTitle="面接ログを新規作成" headerDescription="質問・回答・自己評価を記録" headerActions={headerActions}>
      <InterviewForm mode="create" companyOptions={companyOptions} />
    </AppLayout>
  );
}
