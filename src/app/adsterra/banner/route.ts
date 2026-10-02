import type { NextRequest } from "next/server";

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

function buildBannerDocument(size: keyof typeof bannerConfig) {
  const config = bannerConfig[size];
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
<style>
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:transparent}
body{display:flex;align-items:center;justify-content:center}
</style>
</head>
<body>
<script>
(function () {
  var sent = false;
  function notifyReady() {
    if (sent) return;
    var creative = document.querySelector("iframe, img, a[href]");
    if (!creative) return;
    sent = true;
    parent.postMessage({ type: "ceritaria-adsterra-banner-ready", size: "${size}" }, location.origin);
  }
  new MutationObserver(notifyReady).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("load", function () { setTimeout(notifyReady, 100); });
  setTimeout(notifyReady, 800);
})();
</script>
<script>window.atOptions=${options};</script>
<script src="${config.src}"></script>
</body>
</html>`;
}

export function GET(request: NextRequest) {
  const size = request.nextUrl.searchParams.get("size") === "desktop" ? "desktop" : "mobile";

  return new Response(buildBannerDocument(size), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
