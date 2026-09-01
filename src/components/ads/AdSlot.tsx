"use client";
import { useEffect } from "react";

interface AdSlotProps { label?: string; }
declare global { interface Window { adsbygoogle?: unknown[]; } }

export function AdSlot({ label = "Iklan" }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT;

  useEffect(() => {
    if (!client || !slot) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* third-party failure must not break content */ }
  }, [client, slot]);

  if (!client || !slot) return null;
  return (
    <aside className="my-10 min-h-28 rounded-2xl border border-dashed border-[var(--border)] p-3" aria-label={label}>
      <p className="mb-2 text-center text-[10px] uppercase tracking-widest muted">{label}</p>
      <ins className="adsbygoogle block" style={{ display: "block" }} data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
