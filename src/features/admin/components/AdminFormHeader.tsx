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
    <header className="mb-5 flex min-w-0 flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-black tracking-[0.18em] text-red-600 sm:text-xs">{eyebrow}</p>
        <h1 className="mt-1.5 break-words text-[28px] font-black leading-tight text-[var(--text)] sm:mt-2 sm:text-4xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-[var(--muted)] sm:mt-2 sm:text-sm">{description}</p>
      </div>
      <Link href={backHref} className="min-h-10 shrink-0 self-start rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-bold text-[var(--text)] active:bg-[var(--surface-2)] sm:min-h-11 sm:self-auto sm:px-4 sm:py-3 sm:hover:bg-[var(--surface-2)]">
        ← {backLabel}
      </Link>
    </header>
  );
}
