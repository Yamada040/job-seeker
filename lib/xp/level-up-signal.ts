// XP付与の結果をサーバー（Server Action / Route Handler）からフロントへ伝えるためのワンショット信号。
// redirect() で終わるアクションは戻り値を返せないため、Cookie を経由して通知する。
// Cookie には付与後の xp / level / leveledUp を載せるので、フロントは DB を再取得せずに表示を更新できる。
// XpBadge がマウント時・XP_UPDATED_EVENT 受信時に Cookie を読み取り、消費（削除）する。

export const XP_STATUS_COOKIE = "xp-status";
export const XP_UPDATED_EVENT = "xp:updated";

export type XpStatusSignal = {
  xp: number;
  level: number;
  leveledUp: number | null;
};

// サーバー・クライアント共通: Cookie 値のエンコード/デコード
export function encodeXpStatus(status: XpStatusSignal): string {
  return encodeURIComponent(JSON.stringify(status));
}

// クライアント専用: Cookie を読み取って削除し、XP付与結果を返す
export function consumeXpStatusCookie(): XpStatusSignal | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${XP_STATUS_COOKIE}=`));
  if (!match) return null;

  document.cookie = `${XP_STATUS_COOKIE}=; path=/; max-age=0`;
  try {
    const parsed = JSON.parse(
      decodeURIComponent(match.slice(XP_STATUS_COOKIE.length + 1))
    ) as Partial<XpStatusSignal>;
    if (typeof parsed.xp !== "number" || typeof parsed.level !== "number") {
      return null;
    }
    return {
      xp: parsed.xp,
      level: parsed.level,
      leveledUp: typeof parsed.leveledUp === "number" ? parsed.leveledUp : null,
    };
  } catch {
    return null;
  }
}

// クライアント専用: XP 付与が完了したことを XpBadge に通知する（fetch ベースのフォームから呼ぶ）
export function notifyXpUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(XP_UPDATED_EVENT));
}
