"use client";

import { useState } from "react";

interface Props {
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (body: string) => Promise<void>;
  onCancel?: () => void;
}

export function CommentComposer({ placeholder = "Tulis komentar...", submitLabel = "Kirim", onSubmit, onCancel }: Props) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = body.trim();
    if (!value) return;
    setBusy(true);
    setError("");
    try {
      await onSubmit(value);
      setBody("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Komentar gagal dikirim.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={800}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-[var(--border)] bg-zinc-950 px-4 py-3 text-sm leading-6 outline-none focus:border-red-500"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-zinc-500">{body.length}/800</span>
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="min-h-10 rounded-xl px-3 text-sm font-bold text-zinc-400 hover:text-white">
              Batal
            </button>
          )}
          <button disabled={busy || !body.trim()} className="min-h-10 rounded-xl bg-red-600 px-4 text-sm font-black text-white disabled:opacity-50">
            {busy ? "Mengirim..." : submitLabel}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </form>
  );
}
