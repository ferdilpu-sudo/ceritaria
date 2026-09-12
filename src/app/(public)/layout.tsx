import Script from "next/script";
import { PublicShell } from "@/components/layout/PublicShell";
import { PublicAnalyticsTracker } from "@/features/analytics/components/PublicAnalyticsTracker";
import { ADSENSE_CLIENT_ID } from "@/lib/adsense-config";
import { getOptionalPublicEnv } from "@/lib/env";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { gaId } = getOptionalPublicEnv();

  return (
    <>
      <PublicAnalyticsTracker />
      <PublicShell>{children}</PublicShell>
      <Script async strategy="afterInteractive" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`} crossOrigin="anonymous" />
      {gaId && <><Script async strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} /><Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId.replace(/'/g, "")}');`}</Script></>}
    </>
  );
}
