"use client";

import { useEffect, useId, useMemo, useState } from "react";

const NATIVE_CONTAINER_ID = "container-9dedcf367d7ac7f7feac85ead0fff009";
const NATIVE_SCRIPT_SRC = "https://pl31276839.profitableratecpmnetwork.com/9dedcf367d7ac7f7feac85ead0fff009/invoke.js";

function createNativeDocument(frameId: string) {
  const safeFrameId = JSON.stringify(frameId).replace(/</g, "\\u003c");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;padding:0;width:100%;min-height:1px;overflow:hidden;background:transparent}#${NATIVE_CONTAINER_ID}{width:100%}</style>
</head>
<body>
<script>
(function(){
  var frameId=${safeFrameId};
  function reportHeight(){
    var height=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight,1);
    parent.postMessage({source:"ceritaria-adsterra-native",frameId:frameId,height:height},"*");
  }
  window.addEventListener("load",reportHeight);
  new ResizeObserver(reportHeight).observe(document.body);
  setTimeout(reportHeight,500);
  setTimeout(reportHeight,1500);
})();
</script>
<script async data-cfasync="false" src="${NATIVE_SCRIPT_SRC}"></script>
<div id="${NATIVE_CONTAINER_ID}"></div>
</body>
</html>`;
}

export function AdsterraNative({ label = "Iklan" }: { label?: string }) {
  const frameId = useId();
  const [height, setHeight] = useState(180);
  const srcDoc = useMemo(() => createNativeDocument(frameId), [frameId]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: string; frameId?: string; height?: number } | null;
      if (data?.source !== "ceritaria-adsterra-native" || data.frameId !== frameId) return;
      if (typeof data.height !== "number" || !Number.isFinite(data.height)) return;
      setHeight(Math.min(Math.max(Math.ceil(data.height), 80), 900));
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frameId]);

  return (
    <aside className="my-8 sm:my-10" aria-label={label}>
      <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{label}</p>
      <iframe
        title={label}
        srcDoc={srcDoc}
        width="100%"
        height={height}
        className="block w-full border-0 bg-transparent transition-[height] duration-200"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </aside>
  );
}
