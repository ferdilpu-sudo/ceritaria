import Script from "next/script";
import { PublicShell } from "@/components/layout/PublicShell";
import { PublicAnalyticsTracker } from "@/features/analytics/components/PublicAnalyticsTracker";
import { getOptionalPublicEnv } from "@/lib/env";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { adsenseClientId, gaId } = getOptionalPublicEnv();

  return (
    <>
      <PublicAnalyticsTracker />
      <PublicShell>{children}</PublicShell>
      {adsenseClientId && <Script async strategy="afterInteractive" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClientId)}`} crossOrigin="anonymous" />}
      {gaId && <><Script async strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} /><Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId.replace(/'/g, "")}');`}</Script></>}
    </>
  );
}
