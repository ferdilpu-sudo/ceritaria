import type { ReactNode } from "react";

interface AdminFormSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  guideId?: string;
}

export function AdminFormSection({ title, description, children, guideId }: AdminFormSectionProps) {
  return (
    <section data-guide={guideId} className="surface rounded-2xl p-5 sm:p-6">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-lg font-black text-[var(--text)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
