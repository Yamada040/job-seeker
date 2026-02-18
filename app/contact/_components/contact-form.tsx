"use client";

import { FormEvent, useRef, useState } from "react";
import { contactRequestSchema } from "@/lib/validation/schemas/contact";

interface ContactFormProps {
  displayName: string;
  email: string;
}

type SubmitState =
  | { status: "idle"; message: null }
  | { status: "submitting"; message: null }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function ContactForm({ displayName, email }: ContactFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: null,
  });
  const isSubmittingRef = useRef(false);
  const requestIdRef = useRef(0);
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    const currentRequestId = ++requestIdRef.current;
    setSubmitState({ status: "idle", message: null });
    const form = event.currentTarget;

    const formData = new FormData(event.currentTarget);
    const validation = contactRequestSchema.safeParse({
      subject: formData.get("subject"),
      message: formData.get("message"),
    });

    if (!validation.success) {
      setSubmitState({
        status: "error",
        message: validation.error.issues[0]?.message ?? "入力内容を確認してください",
      });
      isSubmittingRef.current = false;
      return;
    }

    setSubmitState({ status: "submitting", message: null });
    try {
      const [response] = await Promise.all([
        fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validation.data),
        }),
        wait(600),
      ]);
      const result = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            message?: string;
            error?: string;
          }
        | null;

      if (!response.ok || !result?.ok) {
        if (requestIdRef.current !== currentRequestId) return;
        setSubmitState({
          status: "error",
          message: result?.error ?? "送信に失敗しました。時間をおいて再度お試しください。",
        });
        return;
      }

      if (requestIdRef.current !== currentRequestId) return;
      setSubmitState({
        status: "success",
        message: result.message ?? "送信に成功しました。",
      });
      form.reset();
    } catch {
      if (requestIdRef.current !== currentRequestId) return;
      setSubmitState({
        status: "error",
        message: "送信に失敗しました。通信環境を確認して再度お試しください。",
      });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-xs text-white/70">
          登録ユーザー名
          <input
            value={displayName || "未設定"}
            disabled
            className="dq-input text-sm"
          />
        </label>
        <label className="block space-y-1 text-xs text-white/70">
          ログインメール
          <input
            value={email}
            disabled
            className="dq-input text-sm"
          />
        </label>
      </div>

      <label className="block space-y-1 text-xs text-white/70">
        件名
        <input
          name="subject"
          className="dq-input text-sm"
          placeholder="例）ログインについて"
          required
        />
      </label>

      <label className="block space-y-1 text-xs text-white/70">
        お問い合わせ内容
        <textarea
          name="message"
          rows={8}
          className="dq-input text-sm"
          placeholder="お問い合わせ内容をご記入ください"
          required
        />
      </label>

      {submitState.status === "error" ? (
        <p className="text-xs text-rose-700 dark:text-rose-300">{submitState.message}</p>
      ) : null}
      {submitState.status === "success" ? (
        <p className="text-xs text-emerald-700 dark:text-emerald-300">{submitState.message}</p>
      ) : null}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-white/60">
          送信内容には登録ユーザー名とログインメールが含まれます。
        </p>
        <button
          type="submit"
          disabled={submitState.status === "submitting"}
          className="sidebar-link-style text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitState.status === "submitting" ? "送信状態を確認中..." : "送信する"}
        </button>
      </div>
    </form>
  );
}
