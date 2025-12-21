"use client";

import { useEffect, useState } from "react";

type FieldConfig = {
  name: string;
  label: string;
};

type Props = {
  formId: string;
  maxLen: number;
  fields: FieldConfig[];
};

export function FormLengthGuard({ formId, maxLen, fields }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const handleSubmit = (e: Event) => {
      const formData = new FormData(form);
      for (const { name, label } of fields) {
        const value = (formData.get(name) as string | null) ?? null;
        if (value && value.length > maxLen) {
          e.preventDefault();
          setMessage(`${label}は${maxLen}文字以内で入力してください`);
          window.clearTimeout((FormLengthGuard as unknown as { timer?: number }).timer);
          (FormLengthGuard as unknown as { timer?: number }).timer = window.setTimeout(() => setMessage(null), 3500);
          return;
        }
      }
      setMessage(null);
    };

    form.addEventListener("submit", handleSubmit);
    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, [formId, maxLen, fields]);

  if (!message) return null;

  return (
    <div className="fixed right-4 top-4 z-50">
      <div className="rounded-xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-lg">
        {message}
      </div>
    </div>
  );
}
