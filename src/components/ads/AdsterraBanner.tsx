"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 640px)";

const bannerSize = {
  mobile: { width: 320, height: 50 },
  desktop: { width: 728, height: 90 },
} as const;

function subscribeToDesktop(callback: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function AdsterraBanner({ label = "Iklan" }: { label?: string }) {
  const desktop = useSyncExternalStore(subscribeToDesktop, getDesktopSnapshot, getServerSnapshot);
  const size = desktop ? "desktop" : "mobile";
  const dimensions = bannerSize[size];
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setReady(false);
    setTimedOut(false);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type !== "ceritaria-adsterra-banner-ready") return;
      if (event.data?.size !== size) return;
      setReady(true);
    };

    const timeout = window.setTimeout(() => setTimedOut(true), 6000);
    window.addEventListener("message", onMessage);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
    };
  }, [size]);

  if (timedOut && !ready) return null;

  return (
    <aside
      className={ready ? "my-8 overflow-hidden text-center sm:my-10" : "h-0 overflow-hidden"}
      aria-label={ready ? label : undefined}
      aria-hidden={!ready}
    >
      {ready && <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{label}</p>}
      <div className="mx-auto flex max-w-full justify-center overflow-hidden bg-transparent">
        <iframe
          ref={frameRef}
          key={size}
          title={label}
          src={`/adsterra/banner?size=${size}`}
          width={dimensions.width}
          height={dimensions.height}
          className={`max-w-full border-0 bg-transparent transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}
          referrerPolicy="strict-origin-when-cross-origin"
          scrolling="no"
          onLoad={() => {
            const document = frameRef.current?.contentDocument;
            if (document?.querySelector("iframe, img, a[href]")) setReady(true);
          }}
        />
      </div>
    </aside>
  );
}
