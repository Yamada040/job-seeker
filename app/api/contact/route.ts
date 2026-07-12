import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server";
import { contactRequestSchema } from "@/lib/validation/schemas/contact";
import { Database } from "@/lib/database.types";

export const runtime = "nodejs";

const CONTACT_TO_EMAIL = "syuuto20030912@gmail.com";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function createSmtpTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "0");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user, pass },
  });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerActionClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED", error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validation = contactRequestSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { ok: false, code: "INVALID_INPUT", error: validation.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userData.user.id)
    .maybeSingle<Pick<ProfileRow, "full_name">>();

  const displayName =
    profile?.full_name?.trim() ||
    userData.user.user_metadata?.full_name ||
    userData.user.user_metadata?.name ||
    "未設定";
  const senderEmail = userData.user.email ?? "unknown";

  const transporter = createSmtpTransport();
  if (!transporter) {
    return NextResponse.json(
      { ok: false, code: "SMTP_ENV_MISSING", error: "メール送信設定が未完了です。環境変数を確認してください。" },
      { status: 500 },
    );
  }

  try {
    const info = await transporter.sendMail({
      from: `"就活copilot" <${process.env.SMTP_USER}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: senderEmail,
      subject: `[就活copilot お問い合わせ] ${validation.data.subject}`,
      text: [
        `登録ユーザー名: ${displayName}`,
        `ログインメール: ${senderEmail}`,
        `ユーザーID: ${userData.user.id}`,
        "",
        "お問い合わせ内容:",
        validation.data.message,
      ].join("\n"),
    });

    if (info.rejected?.length) {
      return NextResponse.json(
        { ok: false, code: "SMTP_REJECTED", error: "送信に失敗しました。時間をおいて再度お試しください。" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "送信に成功しました。",
    });
  } catch (error) {
    console.error("Failed to send contact email", error);
    return NextResponse.json(
      { ok: false, code: "SMTP_SEND_FAILED", error: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 },
    );
  }
}
