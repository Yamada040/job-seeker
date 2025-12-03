"use client";

type Props = {
  message?: string | null;
};

export function Notice({ message }: Props) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-emerald-300/50 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
      {message}
    </div>
  );
}
