"use client";

import { useRealtimeVisitors } from "@/features/analytics/hooks/useRealtimeVisitors";

export function RealtimeVisitorsPanel() {
  const realtime = useRealtimeVisitors();

  return (
    <section className="surface rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-[11px] font-black tracking-[0.18em] text-emerald-700">LIVE</p>
          </div>
          <h2 className="mt-1 text-xl font-black text-[var(--text)]">Visitor realtime</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">Perkiraan dari sesi browser yang sedang terhubung.</p>
        </div>
        <p className="text-4xl font-black text-[var(--text)]">{realtime.onlineCount}</p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">Sedang membuka</p>
          <div className="mt-3 space-y-2">
            {realtime.paths.slice(0, 5).map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-[var(--text)]">{item.label}</span>
                <span className="font-bold text-[var(--muted)]">{item.value}</span>
              </div>
            ))}
            {!realtime.paths.length && <p className="text-sm text-[var(--muted)]">Belum ada visitor online.</p>}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">Device online</p>
          <div className="mt-3 space-y-2">
            {realtime.devices.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="capitalize text-[var(--text)]">{item.label}</span>
                <span className="font-bold text-[var(--muted)]">{item.value}</span>
              </div>
            ))}
            {!realtime.devices.length && <p className="text-sm text-[var(--muted)]">Menunggu presence.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
