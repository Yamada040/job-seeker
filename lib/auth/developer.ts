import "server-only";

function parseDeveloperUserIds() {
  const raw = process.env.DEV_ADMIN_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function isDeveloperUserId(userId: string | null | undefined) {
  if (!userId) return false;
  return parseDeveloperUserIds().has(userId);
}
