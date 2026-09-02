"use client";

import Link from "next/link";
import { useRealtimeVisitors } from "@/features/analytics/hooks/useRealtimeVisitors";
import type { AnalyticsReport } from "@/features/analytics/types/analytics";

function Metric({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className="text-2xl font-black leading-none text-[var(--text)]">{value.toLocaleString("id-ID")}</p>
        <p className="text-right text-[11px] leading-4 text-[var(--muted)]">{hint}</p>
      </div>
    </div>
  );
}

export function AnalyticsDashboardSummary({ report }: { report: AnalyticsReport }) {
  const realtime = useRealtimeVisitors();
  const summary = report.summary;

  return (
    <section className="surface rounded-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-[10px] font-black tracking-[0.18em] text-emerald-700">REALTIME</p>
          </div>
          <h2 className="mt-1 text-lg font-black text-[var(--text)]">Traffic penonton</h2>
        </div>
        <Link href="/admin/analytics" className="min-h-10 rounded-lg px-2 py-2.5 text-sm font-bold text-[var(--muted)] hover:text-[var(--text)]">
          Buka Analytics →
        </Link>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Online sekarang" value={realtime.onlineCount} hint="Sesi aktif realtime" />
        <Metric label="Pageview hari ini" value={summary.todayPageviews} hint="Waktu Jakarta" />
        <Metric label="Visitor hari ini" value={summary.todayVisitors} hint="Visitor anonim unik" />
        <Metric label="Visitor 7 hari" value={summary.periodVisitors} hint={`${summary.periodPageviews.toLocaleString("id-ID")} pageview`} />
      </div>
    </section>
  );
}
