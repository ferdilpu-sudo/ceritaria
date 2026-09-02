interface AdminMetricCardProps {
  label: string;
  value: number;
  hint: string;
  accent?: boolean;
}

export function AdminMetricCard({ label, value, hint, accent = false }: AdminMetricCardProps) {
  return (
    <article className="surface relative overflow-hidden rounded-xl px-4 py-3.5 sm:px-4 sm:py-4">
      {accent && <span className="absolute inset-x-0 top-0 h-0.5 bg-[var(--primary)]" />}
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-3xl font-black leading-none tracking-tight text-[var(--text)]">{value}</p>
        <p className="text-right text-[11px] leading-4 text-[var(--muted)]">{hint}</p>
      </div>
    </article>
  );
}
