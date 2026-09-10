"use client";

import { useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 640px)";

const bannerConfig = {
  mobile: {
    key: "459814d0e0d9dc6611affced468294e7",
    width: 320,
    height: 50,
    src: "https://www.highrevenueformat.com/459814d0e0d9dc6611affced468294e7/invoke.js",
  },
  desktop: {
    key: "3ed9626dc5b7a7aaecdd1d4cec28bbb6",
    width: 728,
    height: 90,
    src: "https://www.highrevenueformat.com/3ed9626dc5b7a7aaecdd1d4cec28bbb6/invoke.js",
  },
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

function createBannerDocument(config: (typeof bannerConfig)[keyof typeof bannerConfig]) {
  const options = JSON.stringify({
    key: config.key,
    format: "iframe",
    height: config.height,
    width: config.width,
    params: {},
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:transparent}body{display:flex;align-items:center;justify-content:center}</style>
</head>
<body>
<script>window.atOptions=${options};</script>
<script src="${config.src}"></script>
</body>
</html>`;
}

export function AdsterraBanner({ label = "Iklan" }: { label?: string }) {
  const desktop = useSyncExternalStore(subscribeToDesktop, getDesktopSnapshot, getServerSnapshot);
  const config = desktop ? bannerConfig.desktop : bannerConfig.mobile;

  return (
    <aside className="my-8 overflow-hidden text-center sm:my-10" aria-label={label}>
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{label}</p>
      <div className="mx-auto flex max-w-full justify-center overflow-hidden">
        <iframe
          key={config.key}
          title={label}
          srcDoc={createBannerDocument(config)}
          width={config.width}
          height={config.height}
          className="max-w-full border-0 bg-transparent"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </aside>
  );
}
