import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, UserCircleIcon } from "@heroicons/react/24/outline";

import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { ROUTES } from "@/lib/constants/routes";
import { updateProfile } from "./actions";
import { AppLayout } from "@/app/_components/layout";
import { Database } from "@/lib/database.types";
import { FormLengthGuard } from "@/app/_components/form-length-guard";
import { MAX_TEXT_LEN, PROFILE_FIELDS } from "@/app/_components/form-length-guard.config";

const avatarOptions = [
  { id: "sunrise", label: "Sunrise", src: "/avatars/sunrise.svg" },
  { id: "ocean", label: "Ocean", src: "/avatars/ocean.svg" },
];

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default async function ProfilePage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect(ROUTES.LOGIN);
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect(ROUTES.LOGIN);
  const userId = userData.user.id;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, university, faculty, avatar_id, target_industry, career_axis, goal_state")
    .eq("id", userId)
    .maybeSingle<
      Pick<ProfileRow, "full_name" | "university" | "faculty" | "avatar_id" | "target_industry" | "career_axis" | "goal_state">
    >();

  const profile: Pick<
    ProfileRow,
    "full_name" | "university" | "faculty" | "avatar_id" | "target_industry" | "career_axis" | "goal_state"
  > =
    profileData ?? {
      full_name: "",
      university: "",
      faculty: "",
      avatar_id: "",
      target_industry: "",
      career_axis: "",
      goal_state: "",
    };

  const headerActions = (
    <div className="flex gap-3">
      <Link href={ROUTES.DASHBOARD} className="mvp-button mvp-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        ダッシュボードへ
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle="プロフィール"
      headerDescription="基本情報と、志望業界・大切にしたい軸を設定します。"
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      <form
        id="profile-form"
        action={updateProfile}
        className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80"
      >
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">氏名</span>
              <input
                name="full_name"
                defaultValue={profile.full_name ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="例）山田 太郎"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">メール</span>
              <input
                value={userData.user.email ?? ""}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">大学</span>
              <input
                name="university"
                defaultValue={profile.university ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="例）○○大学"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">学部・学科</span>
              <input
                name="faculty"
                defaultValue={profile.faculty ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="例）経済学部 経済学科"
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">志望業界（任意）</span>
              <input
                name="target_industry"
                defaultValue={profile.target_industry ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="例）IT、コンサル、メーカー など"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">大切にしたい軸（任意）</span>
              <input
                name="career_axis"
                defaultValue={profile.career_axis ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="例）成長環境、技術志向、社会貢献 など"
              />
            </label>
          </div>

          <div>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">就活で達成したい状態（短文）</span>
              <textarea
                name="goal_state"
                defaultValue={profile.goal_state ?? ""}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="例）自社開発で技術を磨ける環境に入社する / 社会課題に取り組む事業で働く など"
              />
            </label>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-700">アバターを選ぶ</span>
            <div className="grid gap-3 sm:grid-cols-2">
              {avatarOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 transition-colors ${
                    profile.avatar_id === opt.id ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="avatar_id"
                    value={opt.id}
                    defaultChecked={profile.avatar_id === opt.id}
                    className="h-4 w-4 accent-amber-300"
                  />
                  <Image
                    src={opt.src}
                    alt={opt.label}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 object-cover"
                  />
                  <span className="text-sm text-slate-900">{opt.label}</span>
                </label>
              ))}
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 transition-colors ${
                  !profile.avatar_id ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input type="radio" name="avatar_id" value="" defaultChecked={!profile.avatar_id} className="h-4 w-4 accent-amber-300" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600">
                  なし
                </div>
                <span className="text-sm text-slate-900">選択しない</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="mvp-button mvp-button-primary">
              <UserCircleIcon className="h-4 w-4" />
              保存する
            </button>
          </div>
        </div>
      </form>
      <FormLengthGuard formId="profile-form" maxLen={MAX_TEXT_LEN} fields={PROFILE_FIELDS} />
    </AppLayout>
  );
}
