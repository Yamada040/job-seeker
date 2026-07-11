import { AppLayout } from "@/app/_components/layout";
import { Database } from "@/lib/database.types";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { ContactForm } from "./_components/contact-form";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default async function ContactPage() {
  const supabase = await createSupabaseReadonlyClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userData.user!.id)
    .maybeSingle<Pick<ProfileRow, "full_name">>();

  const displayName =
    profileData?.full_name?.trim() ||
    userData.user!.user_metadata?.full_name ||
    userData.user!.user_metadata?.name ||
    "未設定";
  const email = userData.user!.email ?? "";

  return (
    <AppLayout
      headerTitle="お問い合わせ"
      headerDescription="不具合やご要望を運営に送信できます"
      className="space-y-6"
    >
      <section className="rounded-xl border border-[#3f3f46] bg-[#111111] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200">
          Contact
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">
          お問い合わせフォーム
        </h2>
        <p className="mt-1 text-sm text-white/70">
          内容を入力して送信すると、そのまま運営に送信されます。
        </p>

        <div className="mt-4 rounded-lg border border-[#3f3f46] bg-[#1a1a1a] p-4">
          <ContactForm displayName={displayName} email={email} />
        </div>
      </section>
    </AppLayout>
  );
}
