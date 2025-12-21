import { createSupabaseActionClient } from "@/lib/supabase/supabase-server";

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

function computeLevel(xp: number) {
  // Level 1 at 0xp, +1 level per 50xp
  return Math.max(1, Math.floor(xp / 50) + 1);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function awardXp(
  userId: string,
  action: XpAction,
  opts?: { refId?: string | null; supabase?: Client }
) {
  const rule = XP_CONFIG[action];
  if (!rule) return;

  const supabase = opts?.supabase ?? (await createSupabaseActionClient());
  if (!supabase) return;

  // duplicate prevention by refId
  if (opts?.refId) {
    const { data: existing } = await supabase
      .from("xp_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("action", action)
      .eq("ref_id", opts.refId)
      .maybeSingle();
    if (existing) return;
  } else if (rule.requireRefId) {
    // If refId is required and not provided, skip to avoid accidental multi-grant
    return;
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
    if ((count ?? 0) >= rule.dailyCap) return;
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
    if (recent) return;
  }

  const amount = rule.amount;
  const { data: profileRow } = await supabase.from("profiles").select("xp").eq("id", userId).maybeSingle();
  const currentXp = profileRow?.xp ?? 0;
  const nextXp = currentXp + amount;
  const level = computeLevel(nextXp);

  await supabase.from("profiles").upsert({ id: userId, xp: nextXp, level }).eq("id", userId);
  await supabase.from("xp_logs").insert({
    user_id: userId,
    xp: amount,
    action,
    ref_id: opts?.refId ?? null,
  });
}

export type { XpAction };
