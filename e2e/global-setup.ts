import path from "node:path";
import { request } from "@playwright/test";
import { createE2eAdminClient } from "./support/admin-client";

export const AUTH_STORAGE_STATE_A = path.join(__dirname, ".auth/userA.json");
export const AUTH_STORAGE_STATE_B = path.join(__dirname, ".auth/userB.json");

const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "E2E_TEST_MODE",
  "E2E_TEST_SECRET",
  "E2E_TEST_USER_EMAIL",
  "E2E_TEST_USER_PASSWORD",
  "E2E_TEST_USER2_EMAIL",
  "E2E_TEST_USER2_PASSWORD",
] as const;

async function ensureTestUserExists(email: string, password: string) {
  const admin = createE2eAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  // ユーザーが既に存在する場合のエラーは無視する（冪等にするため）。
  // Supabaseの実際のメッセージは "A user with this email address has already been
  // registered" のように "already" と "registered" の間に語が挟まるため、
  // 隣接一致ではなく緩めのパターンで判定する。
  if (error && !/already.*(registered|exists)/i.test(error.message)) {
    throw error;
  }
}

async function loginAndSaveState(baseURL: string, user: "a" | "b", storagePath: string) {
  const requestContext = await request.newContext({ baseURL });
  const response = await requestContext.post("/api/test-support/login", {
    headers: { "x-e2e-secret": process.env.E2E_TEST_SECRET! },
    data: { user },
  });
  if (!response.ok()) {
    throw new Error(`[e2e] test-support login (${user}) failed: ${response.status()} ${await response.text()}`);
  }
  await requestContext.storageState({ path: storagePath });
  await requestContext.dispose();
}

export default async function globalSetup() {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(
      `[e2e] E2Eテストユーザーの環境変数が未設定のため、認証が必要なテストはスキップされます。不足: ${missing.join(", ")}`,
    );
    return;
  }

  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

  await ensureTestUserExists(process.env.E2E_TEST_USER_EMAIL!, process.env.E2E_TEST_USER_PASSWORD!);
  await ensureTestUserExists(process.env.E2E_TEST_USER2_EMAIL!, process.env.E2E_TEST_USER2_PASSWORD!);

  await loginAndSaveState(baseURL, "a", AUTH_STORAGE_STATE_A);
  await loginAndSaveState(baseURL, "b", AUTH_STORAGE_STATE_B);
}
