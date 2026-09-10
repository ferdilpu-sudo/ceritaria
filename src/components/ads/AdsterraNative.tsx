"use client";

import { useEffect, useRef } from "react";

const NATIVE_CONTAINER_ID = "container-9dedcf367d7ac7f7feac85ead0fff009";
const NATIVE_SCRIPT_SRC = "https://pl31276839.profitableratecpmnetwork.com/9dedcf367d7ac7f7feac85ead0fff009/invoke.js";

export function AdsterraNative({ label = "Iklan" }: { label?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const container = host.querySelector(`#${NATIVE_CONTAINER_ID}`);
    if (!container) return;

    container.replaceChildren();

    const script = document.createElement("script");
    script.async = true;
    script.src = NATIVE_SCRIPT_SRC;
    script.setAttribute("data-cfasync", "false");
    script.dataset.ceritariaAdsterraNative = "true";

    host.insertBefore(script, container);

    return () => {
      script.remove();
      container.replaceChildren();
    };
  }, []);

  return (
    <aside className="my-8 sm:my-10" aria-label={label}>
      <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{label}</p>
      <div ref={hostRef} className="min-h-0 w-full overflow-hidden bg-transparent">
        <div id={NATIVE_CONTAINER_ID} className="w-full" />
      </div>
    </aside>
  );
}
