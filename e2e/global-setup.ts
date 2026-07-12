import path from "node:path";
import { request } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

export const AUTH_STORAGE_STATE = path.join(__dirname, ".auth/user.json");

// next/headers に依存する lib/supabase/supabase-server.ts は Next.js の
// リクエストスコープ外（PlaywrightのNodeプロセス）から読み込むと壊れやすいため、
// ここでは admin クライアントを直接組み立てる。

const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "E2E_TEST_MODE",
  "E2E_TEST_SECRET",
  "E2E_TEST_USER_EMAIL",
  "E2E_TEST_USER_PASSWORD",
] as const;

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureTestUserExists(email: string, password: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  // ユーザーが既に存在する場合のエラーは無視する（冪等にするため）
  if (error && !/already registered|already exists/i.test(error.message)) {
    throw error;
  }
}

export default async function globalSetup() {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(
      `[e2e] テスト用Supabaseプロジェクトの環境変数が未設定のため、認証が必要なテストはスキップされます。不足: ${missing.join(", ")}`,
    );
    return;
  }

  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
  const email = process.env.E2E_TEST_USER_EMAIL!;
  const password = process.env.E2E_TEST_USER_PASSWORD!;

  await ensureTestUserExists(email, password);

  const requestContext = await request.newContext({ baseURL });
  const response = await requestContext.post("/api/test-support/login", {
    headers: { "x-e2e-secret": process.env.E2E_TEST_SECRET! },
  });
  if (!response.ok()) {
    throw new Error(`[e2e] test-support login failed: ${response.status()} ${await response.text()}`);
  }

  await requestContext.storageState({ path: AUTH_STORAGE_STATE });
  await requestContext.dispose();
}
