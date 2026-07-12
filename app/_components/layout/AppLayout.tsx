import { isDeveloperUserId } from "@/lib/auth/developer";
import { createSupabaseReadonlyClient } from "@/lib/supabase/supabase-server";
import { AppLayoutClient, type AppLayoutProps } from "./AppLayoutClient";
import type { ProfileLite } from "../xp-badge";

async function fetchProfileLite(): Promise<ProfileLite | null> {
  try {
    const supabase = await createSupabaseReadonlyClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("id", userId)
      .maybeSingle<Pick<ProfileLite, "xp" | "level">>();
    return profile ? { userId, ...profile } : null;
  } catch {
    // fail silently（バッジは既定表示にフォールバック）
    return null;
  }
}

async function fetchIsDeveloper(): Promise<boolean> {
  try {
    const supabase = await createSupabaseReadonlyClient();
    const { data: userData } = await supabase.auth.getUser();
    return isDeveloperUserId(userData?.user?.id);
  } catch {
    return false;
  }
}

/**
 * Server Component ラッパー。
 * データ取得の promise をここで開始し（await しない）、
 * Client Component 側の Suspense + use() でストリーミング表示する。
 */
export function AppLayout(props: AppLayoutProps) {
  const profilePromise = fetchProfileLite();
  const isDeveloperPromise = fetchIsDeveloper();

  return <AppLayoutClient {...props} profilePromise={profilePromise} isDeveloperPromise={isDeveloperPromise} />;
}
