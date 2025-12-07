import Link from "next/link";
import Image from "next/image";
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
  const { data: userData } = supabase ? await supabase.auth.getUser() : { data: null };
  const canEdit = Boolean(userData?.user);
  const userId = userData?.user?.id ?? "guest";
  const { data: profileData } =
    supabase && userData?.user
      ? await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
      : { data: null };

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
        ダッシュボードに戻る
      </Link>
    </div>
  );

  return (
    <AppLayout 
      headerTitle="プロフィール編集"
      headerDescription="名前・大学・学部・アバターを変更できます"
      headerActions={headerActions}
      className="flex flex-col gap-8"
    >
      <form action={updateProfile} className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-md backdrop-blur">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">フルネーム</span>
              <input
                name="full_name"
                defaultValue={profile.full_name ?? ""}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
                placeholder="山田 太郎"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">メール</span>
              <input
                value={userData?.user?.email ?? "未ログイン"}
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
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
                placeholder="○○大学"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">学部</span>
              <input
                name="faculty"
                defaultValue={profile.faculty ?? ""}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300 disabled:opacity-60"
                placeholder="○○学部"
              />
            </label>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-700">アバター（固定画像から選択）</span>
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
                    disabled={!canEdit}
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
                <input type="radio" name="avatar_id" value="" defaultChecked={!profile.avatar_id} disabled={!canEdit} className="h-4 w-4 accent-amber-300" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600">なし</div>
                <span className="text-sm text-slate-900">未設定にする</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={!canEdit}
              className="mvp-button mvp-button-primary disabled:opacity-60"
            >
              <UserCircleIcon className="h-4 w-4" />
              保存
            </button>
          </div>
        </div>
      </form>

      {/* Status Notice */}
      {!canEdit && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-soft">
          デモ表示中です。ログインするとプロフィールを更新できます。
        </div>
      )}
    </AppLayout>
  );
}
