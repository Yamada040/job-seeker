import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, UserCircleIcon } from "@heroicons/react/24/outline";

import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import { updateProfile } from "./actions";
import { AppLayout } from "@/app/_components/layout";

const avatarOptions = [
  { id: "sunrise", label: "Sunrise", src: "/avatars/sunrise.svg" },
  { id: "ocean", label: "Ocean", src: "/avatars/ocean.svg" },
];

export default async function ProfilePage() {
  const supabase = await createSupabaseReadonlyClient();
  if (!supabase) return redirect("/login");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");
  const userId = userData.user.id;
  const { data: profileData } = await supabase.from("profiles").select("full_name, university, faculty, avatar_id").eq("id", userId).maybeSingle();

  const profile = profileData ?? {
    full_name: "",
    university: "",
    faculty: "",
    avatar_id: "",
  };

  const headerActions = (
    <div className="flex gap-3">
      <Link href="/dashboard" className="mvp-button mvp-button-secondary">
        <ArrowLeftIcon className="h-4 w-4" />
        ダッシュボードへ戻る
      </Link>
    </div>
  );

  return (
    <AppLayout
      headerTitle="プロフィール"
      headerDescription="氏名・大学・アバターを管理"
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      <form action={updateProfile} className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">氏名</span>
              <input
                name="full_name"
                defaultValue={profile.full_name ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="山田 太郎"
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
                placeholder="〇〇大学"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">学部</span>
              <input
                name="faculty"
                defaultValue={profile.faculty ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300"
                placeholder="〇〇学部"
              />
            </label>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-700">アバター画像（固定2種）</span>
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
                  <Image src={opt.src} alt={opt.label} width={48} height={48} className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 object-cover" />
                  <span className="text-sm text-slate-900">{opt.label}</span>
                </label>
              ))}
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 transition-colors ${
                  !profile.avatar_id ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input type="radio" name="avatar_id" value="" defaultChecked={!profile.avatar_id} className="h-4 w-4 accent-amber-300" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600">なし</div>
                <span className="text-sm text-slate-900">未選択にする</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button type="submit" className="mvp-button mvp-button-primary">
              <UserCircleIcon className="h-4 w-4" />
              保存する
            </button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
