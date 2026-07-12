import { createE2eAdminClient, createE2eAnonClient } from "./support/admin-client";

// 各テストは自前でクリーンアップするが、途中失敗などで取りこぼした場合の保険として、
// 全テスト終了後にテストユーザーA/Bが所有する es_entries を丸ごと掃除する。
// この2アカウントはE2E専用のため、中身を全削除しても実ユーザーへの影響はない。
async function resolveUserId(email: string, password: string): Promise<string | null> {
  const anon = createE2eAnonClient();
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;
  return data.user.id;
}

export default async function globalTeardown() {
  const requiredKeys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "E2E_TEST_USER_EMAIL",
    "E2E_TEST_USER_PASSWORD",
    "E2E_TEST_USER2_EMAIL",
    "E2E_TEST_USER2_PASSWORD",
  ] as const;
  if (requiredKeys.some((key) => !process.env[key])) return;

  const [idA, idB] = await Promise.all([
    resolveUserId(process.env.E2E_TEST_USER_EMAIL!, process.env.E2E_TEST_USER_PASSWORD!),
    resolveUserId(process.env.E2E_TEST_USER2_EMAIL!, process.env.E2E_TEST_USER2_PASSWORD!),
  ]);
  const userIds = [idA, idB].filter((id): id is string => Boolean(id));
  if (userIds.length === 0) return;

  const admin = createE2eAdminClient();
  const { error, count } = await admin.from("es_entries").delete({ count: "exact" }).in("user_id", userIds);
  if (error) {
    console.warn(`[e2e] テストデータの掃除に失敗しました: ${error.message}`);
    return;
  }
  if (count) {
    console.log(`[e2e] テストユーザーの es_entries を ${count} 件掃除しました`);
  }
}
