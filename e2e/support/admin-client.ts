import { createClient } from "@supabase/supabase-js";
import ws from "ws";

// next/headers に依存する lib/supabase/supabase-server.ts の createSupabaseAdminClient は
// Next.jsのリクエストスコープ外（PlaywrightのNodeプロセス）から読み込むと壊れやすいため、
// ここでは Supabase クライアントを直接組み立てる。
// テストユーザー作成やテストが作成した行の後片付け（本番Supabaseを流用しているため必須）に使う。

// Node 20には標準のWebSocketグローバルが無く、realtime機能を一切使わなくても
// createClient()の内部でRealtimeClientが初期化されエラーになるため、wsで補う。
const SUPABASE_CLIENT_OPTIONS = {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws as unknown as typeof WebSocket },
};

export function createE2eAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    SUPABASE_CLIENT_OPTIONS,
  );
}

export function createE2eAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_CLIENT_OPTIONS,
  );
}
