import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { AUTH_STORAGE_STATE_A } from "./global-setup";

test.describe("ログインページの導線", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Googleでログインボタンが表示され、クリックするとGoogleのOAuth画面へ遷移し始める", async ({ page }) => {
    await page.goto("/login");
    const loginButton = page.getByRole("button", { name: "Googleでログイン" });
    await expect(loginButton).toBeVisible();

    await loginButton.click();
    // 実際のGoogleログインは自動化しない。OAuthへの遷移が始まったことだけを確認する。
    await page.waitForURL(/accounts\.google\.com/, { timeout: 15_000 });
  });
});

test.describe("認証済みセッションでのダッシュボード表示", () => {
  test.skip(
    !fs.existsSync(AUTH_STORAGE_STATE_A),
    "E2Eテストユーザーの環境変数が未設定のためスキップ（docs/testing/e2e-test-plan.md 参照）",
  );
  test.use({ storageState: AUTH_STORAGE_STATE_A });

  test("セッションが確立されていれば/dashboardが表示される", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("現在の目標")).toBeVisible();
  });

  test("ログイン済みで/loginにアクセスすると/dashboardへリダイレクトされる", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
