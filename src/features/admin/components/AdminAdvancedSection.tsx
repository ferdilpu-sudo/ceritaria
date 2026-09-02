import type { ReactNode } from "react";

interface AdminAdvancedSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  guideId?: string;
  defaultOpen?: boolean;
}

export function AdminAdvancedSection({
  title,
  description,
  children,
  guideId,
  defaultOpen = false,
}: AdminAdvancedSectionProps) {
  return (
    <details className="surface group min-w-0 rounded-2xl" {...(defaultOpen ? { open: true } : {})}>
      <summary
        data-guide={guideId}
        className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden sm:px-6"
      >
        <div className="min-w-0">
          <h2 className="font-black text-[var(--text)]">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)] sm:text-sm">{description}</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-lg text-[var(--muted)] transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="border-t border-[var(--border)] px-5 py-5 sm:px-6">{children}</div>
    </details>
  );
}
