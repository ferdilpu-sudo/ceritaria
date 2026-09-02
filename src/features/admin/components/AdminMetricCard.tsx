interface AdminMetricCardProps {
  label: string;
  value: number;
  hint: string;
  accent?: boolean;
}

export function AdminMetricCard({ label, value, hint, accent = false }: AdminMetricCardProps) {
  return (
    <article className="surface relative min-w-0 overflow-hidden rounded-xl px-3.5 py-3.5 sm:px-4 sm:py-4">
      {accent && <span className="absolute inset-x-0 top-0 h-0.5 bg-[var(--primary)]" />}
      <p className="min-w-0 break-words text-[11px] font-semibold leading-4 text-[var(--muted)] sm:text-xs">{label}</p>
      <div className="mt-2 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-end gap-2">
        <p className="text-3xl font-black leading-none tracking-tight text-[var(--text)]">{value}</p>
        <p className="min-w-0 break-words text-right text-[10px] leading-4 text-[var(--muted)] sm:text-[11px]">{hint}</p>
      </div>
    </article>
  );
}
