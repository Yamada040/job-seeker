import Link from "next/link";
import Image from "next/image";

import { createSupabaseReadonlyClient } from "@/lib/supabase/server-readonly";
import { updateProfile } from "./actions";

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,196,38,0.14),transparent_60%)] blur-2xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_60%)] blur-2xl" />
      </div>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-14 sm:px-10 sm:py-16">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">Profile</p>
            <h1 className="text-3xl font-semibold">プロフィール編集</h1>
            <p className="text-sm text-slate-200/80">名前 / 大学 / 学部 / アバターIDを変更できます。</p>
          </div>
          <Link href="/dashboard" className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:bg-white/10">
            戻る
          </Link>
        </div>

        <form
          action={updateProfile}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100 shadow-lg backdrop-blur"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs text-slate-200/80">フルネーム</span>
              <input
                name="full_name"
                defaultValue={profile.full_name ?? ""}
                disabled={!canEdit}
                className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs text-slate-200/80">メール</span>
              <input
                value={userData?.user?.email ?? "未ログイン"}
                disabled
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 outline-none"
              />
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">大学</span>
            <input
              name="university"
              defaultValue={profile.university ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">学部</span>
            <input
              name="faculty"
              defaultValue={profile.faculty ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-300 disabled:opacity-60"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs text-slate-200/80">アバターID（固定画像から選択）</span>
            <div className="grid gap-3 sm:grid-cols-2">
              {avatarOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 ${
                    profile.avatar_id === opt.id ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-slate-900/40"
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
                  <Image src={opt.src} alt={opt.label} width={48} height={48} className="h-12 w-12 rounded-xl border border-white/10 bg-slate-900/60 object-cover" />
                  <span className="text-sm text-white">{opt.label}</span>
                </label>
              ))}
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 ${
                  !profile.avatar_id ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-slate-900/40"
                }`}
              >
                <input type="radio" name="avatar_id" value="" defaultChecked={!profile.avatar_id} disabled={!canEdit} className="h-4 w-4 accent-amber-300" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-xs text-slate-200">なし</div>
                <span className="text-sm text-white">未設定にする</span>
              </label>
            </div>
          </label>

          <button
            type="submit"
            disabled={!canEdit}
            className="w-full rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:translate-y-0.5 hover:shadow-amber-500/50 disabled:opacity-60"
          >
            保存
          </button>
        </form>

        {!canEdit ? (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            デモ表示中です。ログインするとプロフィールを更新できます。
          </div>
        ) : null}
      </main>
    </div>
  );
}
