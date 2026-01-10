"use client";

import { useEffect, useState } from "react";
import { MAX_TEXT_LEN } from "./validation";

type FieldConfig = {
  name: string;
  label: string;
};

type Props = {
  formId: string;
  maxLen?: number;
  fields: ReadonlyArray<FieldConfig>;
};

export function FormLengthGuard({ formId, maxLen, fields }: Props) {
  const limit = maxLen ?? MAX_TEXT_LEN;
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const handleSubmit = (e: Event) => {
      const formData = new FormData(form);
      for (const { name, label } of fields) {
        const value = (formData.get(name) as string | null) ?? null;
        if (value && value.length > limit) {
          e.preventDefault();
          setMessage(`${label}は${limit}文字以内で入力してください`);
          window.clearTimeout((FormLengthGuard as unknown as { timer?: number }).timer);
          (FormLengthGuard as unknown as { timer?: number }).timer = window.setTimeout(() => setMessage(null), 3200);
          return;
        }
      }
      setMessage(null);
    };

    form.addEventListener("submit", handleSubmit);
    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, [formId, limit, fields]);

  if (!message) return null;

  return (
    <div className="fixed right-4 top-4 z-50">
      <div className="rounded-xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-lg">
        {message}
      </div>
    </div>
  );
}
