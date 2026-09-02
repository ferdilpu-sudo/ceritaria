import Link from "next/link";

interface AdminFormActionsProps {
  cancelHref: string;
  saving: boolean;
  disabled?: boolean;
  published: boolean;
  submitLabel: string;
  publishedMessage?: string;
  publishedReady?: boolean;
}

export function AdminFormActions({
  cancelHref,
  saving,
  disabled = false,
  published,
  submitLabel,
  publishedMessage = "Akan langsung tampil untuk penonton",
  publishedReady = true,
}: AdminFormActionsProps) {
  const statusDot = !published ? "bg-zinc-400" : publishedReady ? "bg-emerald-500" : "bg-amber-500";

  return (
    <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 min-w-0 max-w-full rounded-2xl border border-[var(--border)] bg-white/95 p-3 shadow-[0_12px_32px_rgba(16,24,40,0.12)] backdrop-blur sm:bottom-4 sm:p-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2 text-sm sm:items-center">
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full sm:mt-0 ${statusDot}`} />
          <span className="min-w-0 break-words font-semibold leading-5 text-[var(--text)]">
            {published ? publishedMessage : "Akan disimpan dulu, belum tampil ke penonton"}
          </span>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <Link href={cancelHref} className="min-h-11 min-w-0 rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-center text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-2)] sm:px-4">
            Batal
          </Link>
          <button type="submit" disabled={saving || disabled} aria-busy={saving} className="min-h-11 min-w-0 rounded-xl bg-[var(--primary)] px-3 py-3 text-sm font-black text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5">
            {saving ? "Sedang menyimpan…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
