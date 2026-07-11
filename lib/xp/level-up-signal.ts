// レベルアップをサーバー（Server Action / Route Handler）からフロントへ伝えるためのワンショット信号。
// redirect() で終わるアクションは戻り値を返せないため、Cookie を経由して通知する。
// XpBadge がマウント時・XP_UPDATED_EVENT 受信時に Cookie を読み取り、消費（削除）して演出を出す。

export const LEVEL_UP_COOKIE = "xp-level-up";
export const XP_UPDATED_EVENT = "xp:updated";

// クライアント専用: Cookie を読み取って削除し、新しいレベルを返す
export function consumeLevelUpCookie(): number | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LEVEL_UP_COOKIE}=`));
  if (!match) return null;

  document.cookie = `${LEVEL_UP_COOKIE}=; path=/; max-age=0`;
  const level = Number(match.split("=")[1]);
  return Number.isFinite(level) && level > 0 ? level : null;
}

// クライアント専用: XP 付与が完了したことを XpBadge に通知する（fetch ベースのフォームから呼ぶ）
export function notifyXpUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(XP_UPDATED_EVENT));
}
