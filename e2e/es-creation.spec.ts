import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { AUTH_STORAGE_STATE } from "./global-setup";

test.describe("ES作成 → 一覧反映", () => {
  test.skip(
    !fs.existsSync(AUTH_STORAGE_STATE),
    "テスト用SupabaseプロジェクトのE2E環境変数が未設定のためスキップ（docs/testing/e2e-test-plan.md 参照）",
  );
  test.use({ storageState: AUTH_STORAGE_STATE });

  test("タイトルを入力して保存すると一覧に反映される", async ({ page }) => {
    const title = `E2Eテスト-${Date.now()}`;

    await page.goto("/es/new");
    await page.locator('input[name="title"]').fill(title);
    await page.getByRole("button", { name: "下書きとして保存" }).click();

    await expect(page).toHaveURL(/\/es$/);
    await expect(page.getByText(title)).toBeVisible();

    // テスト用Supabaseプロジェクトでも一覧の肥大化を避けるため作成した行を削除する
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await admin.from("es_entries").delete().eq("title", title);
  });
});
