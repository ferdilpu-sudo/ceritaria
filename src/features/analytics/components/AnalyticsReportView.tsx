import Link from "next/link";
import type { AnalyticsPoint, AnalyticsReport } from "@/features/analytics/types/analytics";
import { RealtimeVisitorsPanel } from "@/features/analytics/components/RealtimeVisitorsPanel";

function number(value: number) { return value.toLocaleString("id-ID"); }

function MiniList({ title, items }: { title: string; items: AnalyticsPoint[] }) {
  return (
    <section className="surface rounded-2xl p-5 sm:p-6">
      <h2 className="font-black text-[var(--text)]">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.slice(0, 7).map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="truncate capitalize text-[var(--text)]">{item.label}</span>
            <span className="font-bold text-[var(--muted)]">{number(item.value)}</span>
          </div>
        ))}
        {!items.length && <p className="text-sm text-[var(--muted)]">Belum ada data.</p>}
      </div>
    </section>
  );
}

export function AnalyticsReportView({ report }: { report: AnalyticsReport }) {
  const maxHourly = Math.max(1, ...report.hourly.map((item) => item.value));
  const s = report.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-red-600">ANALYTICS</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--text)] sm:text-4xl">Audience Ceritaria</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">First-party analytics anonim. Tanpa menyimpan IP atau user-agent lengkap.</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <Link key={days} href={`/admin/analytics?days=${days}`} className={`rounded-xl border px-3 py-2 text-sm font-bold ${report.days === days ? "border-red-200 bg-red-50 text-red-700" : "border-[var(--border)] bg-white text-[var(--muted)]"}`}>
              {days} hari
            </Link>
          ))}
        </div>
      </div>

      <RealtimeVisitorsPanel />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Pageview hari ini", s.todayPageviews, "Asia/Jakarta"],
          ["Visitor hari ini", s.todayVisitors, "Anonim unik"],
          [`Pageview ${report.days} hari`, s.periodPageviews, `${number(s.periodSessions)} session`],
          [`Visitor ${report.days} hari`, s.periodVisitors, `${number(s.totalEvents)} total event`],
        ].map(([label, value, hint]) => (
          <article key={String(label)} className="surface rounded-2xl p-5">
            <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-3xl font-black text-[var(--text)]">{number(Number(value))}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>
          </article>
        ))}
      </section>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-[11px] font-black tracking-[0.18em] text-red-600">24 JAM</p><h2 className="mt-1 text-xl font-black text-[var(--text)]">Aktivitas pageview</h2></div>
          <p className="text-xs text-[var(--muted)]">per jam</p>
        </div>
        <div className="mt-6 flex h-36 items-end gap-1.5">
          {report.hourly.map((item) => (
            <div key={item.label} title={`${item.label}: ${item.value}`} className="min-w-0 flex-1 rounded-t bg-red-500/80" style={{ height: `${Math.max(4, (item.value / maxHourly) * 100)}%` }} />
          ))}
          {!report.hourly.length && <p className="self-center text-sm text-[var(--muted)]">Belum ada pageview dalam 24 jam terakhir.</p>}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="font-black text-[var(--text)]">Halaman teratas</h2>
          <div className="mt-4 divide-y divide-[var(--border)]">
            {report.topPages.map((item) => <div key={item.path} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="truncate text-[var(--text)]">{item.path}</span><span className="shrink-0 font-bold text-[var(--muted)]">{number(item.views)} views · {number(item.visitors)} visitor</span></div>)}
            {!report.topPages.length && <p className="py-4 text-sm text-[var(--muted)]">Belum ada data.</p>}
          </div>
        </section>
        <div className="grid gap-5 sm:grid-cols-2"><MiniList title="Device" items={report.devices} /><MiniList title="Referrer" items={report.referrers} /></div>
      </div>

      <MiniList title="Event penonton" items={report.events} />
    </div>
  );
}
