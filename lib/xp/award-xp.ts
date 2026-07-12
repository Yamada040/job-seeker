import { cookies } from "next/headers";
import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";
import { computeLevel } from "@/lib/xp/compute-level";
import { encodeXpStatus, XP_STATUS_COOKIE } from "@/lib/xp/level-up-signal";

type XpRule = {
  amount: number;
  requireRefId?: boolean;
  dailyCap?: number;
  cooldownDays?: number;
};

const XP_CONFIG: Record<string, XpRule> = {
  es_submitted: { amount: 25, requireRefId: true },
  interview_log: { amount: 20, requireRefId: true },
  aptitude_complete: { amount: 15, cooldownDays: 30 },
  self_analysis_complete: { amount: 15, cooldownDays: 30 },
  company_new: { amount: 5, dailyCap: 5, requireRefId: true },
  webtest_question_create: { amount: 5, dailyCap: 3, requireRefId: true },
  webtest_attempt_complete: { amount: 15, dailyCap: 2 },
};

type XpAction = keyof typeof XP_CONFIG;
type Client = Awaited<ReturnType<typeof createSupabaseActionClient>>;

export type AwardXpResult = {
  awarded: boolean;
  // レベルアップした場合は新しいレベル、しなかった場合は null
  leveledUp: number | null;
};

const NOT_AWARDED: AwardXpResult = { awarded: false, leveledUp: null };

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function awardXp(
  userId: string,
  action: XpAction,
  opts?: { refId?: string | null; supabase?: Client },
): Promise<AwardXpResult> {
  const rule = XP_CONFIG[action];
  if (!rule) return NOT_AWARDED;

  const supabase = opts?.supabase ?? (await createSupabaseActionClient());
  if (!supabase) return NOT_AWARDED;

  // duplicate prevention by refId
  if (opts?.refId) {
    const { data: existing } = await supabase
      .from("xp_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("action", action)
      .eq("ref_id", opts.refId)
      .maybeSingle();
    if (existing) return NOT_AWARDED;
  } else if (rule.requireRefId) {
    // If refId is required and not provided, skip to avoid accidental multi-grant
    return NOT_AWARDED;
  }

  // daily cap
  if (rule.dailyCap) {
    const since = startOfToday().toISOString();
    const { count } = await supabase
      .from("xp_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action", action)
      .gte("created_at", since);
    if ((count ?? 0) >= rule.dailyCap) return NOT_AWARDED;
  }

  // cooldown (days)
  if (rule.cooldownDays) {
    const since = new Date(Date.now() - rule.cooldownDays * 24 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("xp_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("action", action)
      .gte("created_at", since)
      .maybeSingle();
    if (recent) return NOT_AWARDED;
  }

  const amount = rule.amount;
  const { data: profileRow } = await supabase.from("profiles").select("xp").eq("id", userId).maybeSingle();
  const currentXp = profileRow?.xp ?? 0;
  const nextXp = currentXp + amount;
  const prevLevel = computeLevel(currentXp);
  const nextLevel = computeLevel(nextXp);
  const leveledUp = nextLevel > prevLevel ? nextLevel : null;

  await supabase.from("profiles").upsert({ id: userId, xp: nextXp, level: nextLevel }).eq("id", userId);
  await supabase.from("xp_logs").insert({
    user_id: userId,
    xp: amount,
    action,
    ref_id: opts?.refId ?? null,
  });

  // redirect() で終わる Server Action は戻り値をクライアントへ返せないため、
  // 付与後の xp / level を Cookie 経由でも通知する（XpBadge が読み取り後に削除するワンショット信号）。
  // フロントはこの値をそのまま表示に反映するので、XP変更時の再フェッチが不要になる。
  try {
    const cookieStore = await cookies();
    cookieStore.set(XP_STATUS_COOKIE, encodeXpStatus({ xp: nextXp, level: nextLevel, leveledUp }), {
      path: "/",
      maxAge: 60 * 5,
      httpOnly: false,
      sameSite: "lax",
    });
  } catch {
    // Cookie を書けないコンテキストでは戻り値のみで通知する
  }

  return { awarded: true, leveledUp };
}

export type { XpAction };
