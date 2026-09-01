import Link from "next/link";

interface AdminFormHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}

export function AdminFormHeader({ eyebrow, title, description, backHref, backLabel }: AdminFormHeaderProps) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black tracking-[0.18em] text-red-600">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black text-[var(--text)] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{description}</p>
      </div>
      <Link href={backHref} className="min-h-11 shrink-0 self-start rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-2)] sm:self-auto">
        ← {backLabel}
      </Link>
    </header>
  );
}
