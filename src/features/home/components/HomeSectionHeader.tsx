import Link from "next/link";

interface HomeSectionHeaderProps {
  eyebrow: string;
  title: string;
  actionHref?: string;
  actionLabel?: string;
  hint?: string;
}

export function HomeSectionHeader({ eyebrow, title, actionHref, actionLabel, hint }: HomeSectionHeaderProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
      <div>
        <p className="mb-1 text-[9px] font-black tracking-[0.22em] text-red-400 sm:mb-1.5 sm:text-[10px]">{eyebrow}</p>
        <h2 className="text-[22px] font-black tracking-[-0.015em] sm:text-[28px]">{title}</h2>
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="hidden min-h-11 items-center text-sm font-bold text-zinc-300 transition hover:text-white sm:inline-flex">{actionLabel} <span aria-hidden="true" className="ml-1">→</span></Link>
      ) : hint ? <span className="hidden text-xs muted sm:block">{hint}</span> : null}
    </div>
  );
}
