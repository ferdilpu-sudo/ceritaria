import type { ReactNode } from "react";

interface AdminFormSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  guideId?: string;
}

export function AdminFormSection({ title, description, children, guideId }: AdminFormSectionProps) {
  return (
    <section className="surface min-w-0 rounded-2xl p-4 sm:p-6">
      <div data-guide={guideId} className="min-w-0 border-b border-[var(--border)] pb-4">
        <h2 className="break-words text-lg font-black text-[var(--text)]">{title}</h2>
        <p className="mt-1 break-words text-sm leading-5 text-[var(--muted)]">{description}</p>
      </div>
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  );
}
