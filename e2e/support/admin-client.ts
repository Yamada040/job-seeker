import { createClient } from "@supabase/supabase-js";

// next/headers に依存する lib/supabase/supabase-server.ts の createSupabaseAdminClient は
// Next.jsのリクエストスコープ外（PlaywrightのNodeプロセス）から読み込むと壊れやすいため、
// ここでは admin クライアントを直接組み立てる。
// テストユーザー作成やテストが作成した行の後片付け（本番Supabaseを流用しているため必須）に使う。
export function createE2eAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
