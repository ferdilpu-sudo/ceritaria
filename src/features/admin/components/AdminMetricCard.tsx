interface AdminMetricCardProps {
  label: string;
  value: number;
  hint: string;
  accent?: boolean;
}

export function AdminMetricCard({ label, value, hint, accent = false }: AdminMetricCardProps) {
  return (
    <article className="surface relative overflow-hidden rounded-2xl p-5 sm:p-6">
      {accent && <span className="absolute inset-x-0 top-0 h-0.5 bg-[var(--primary)]" />}
      <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-4xl font-black tracking-tight text-[var(--text)]">{value}</p>
        <p className="pb-1 text-right text-xs text-[var(--muted)]">{hint}</p>
      </div>
    </article>
  );
}
