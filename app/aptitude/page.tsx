import Link from "next/link";
import { ArrowUturnLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

import { AppLayout } from "@/app/_components/layout";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import AptitudeForm from "./_components/aptitude-form";
import { AptitudeAnswers } from "./types";

export default async function AptitudePage() {
  const supabase = await createSupabaseReadonlyClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("aptitude_results")
    .select("*")
    .eq("user_id", userData.user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const isLocked = Boolean(data?.id);

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
    </div>
  );

  return (
    <AppLayout
      headerTitle="適性チェック"
      headerDescription="興味・強み・価値観を整理して、AI診断で適性の方向性を確認します"
      headerActions={headerActions}
      className="space-y-6"
    >
      <AptitudeForm
        initialAnswers={(data?.answers as AptitudeAnswers) ?? null}
        initialSummary={data?.ai_summary ?? null}
        initialResultId={data?.id ?? null}
        isMonthlyLocked={isLocked}
      />
    </AppLayout>
  );
}
