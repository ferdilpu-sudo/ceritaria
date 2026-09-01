import Link from "next/link";

interface AdminFormActionsProps {
  cancelHref: string;
  saving: boolean;
  disabled?: boolean;
  published: boolean;
  submitLabel: string;
}

export function AdminFormActions({
  cancelHref,
  saving,
  disabled = false,
  published,
  submitLabel,
}: AdminFormActionsProps) {
  return (
    <div className="sticky bottom-4 z-30 rounded-2xl border border-[var(--border)] bg-white/95 p-3 shadow-[0_16px_40px_rgba(16,24,40,0.12)] backdrop-blur sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${published ? "bg-emerald-500" : "bg-zinc-400"}`} />
          <span className="font-semibold text-[var(--text)]">{published ? "Akan tampil sebagai Published" : "Akan tersimpan sebagai Draft"}</span>
        </div>

        <div className="flex gap-2">
          <Link href={cancelHref} className="min-h-11 flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-center text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-2)] sm:flex-none">
            Batal
          </Link>
          <button type="submit" disabled={saving || disabled} className="min-h-11 flex-1 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">
            {saving ? "Menyimpan…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
