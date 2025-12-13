import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon, ArrowUturnLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

import { AppLayout } from "@/app/_components/layout";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { CompanyTable } from "./_components/company-table";

export default async function CompaniesPage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, industry, stage, preference, memo, updated_at")
    .eq("user_id", userData.user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (
    <AppLayout
      headerTitle="企業管理"
      headerDescription="業界・ステータス・志望度を一覧で把握し、編集ページへ遷移できます"
      headerActions={
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="mvp-button mvp-button-secondary">
            <HomeIcon className="h-4 w-4" />
            MVPホーム
          </Link>
          <Link href="/dashboard" className="mvp-button mvp-button-secondary">
            <ArrowUturnLeftIcon className="h-4 w-4" />
            ダッシュボードへ
          </Link>
          <Link href="/companies/new" className="mvp-button mvp-button-primary">
            <PlusIcon className="h-4 w-4" />
            企業を追加
          </Link>
        </div>
      }
    >
      <CompanyTable items={data ?? []} />
    </AppLayout>
  );
}
