import Script from "next/script";
import { PopAdsScript } from "@/components/ads/PopAdsScript";
import { PublicShell } from "@/components/layout/PublicShell";
import { PublicAnalyticsTracker } from "@/features/analytics/components/PublicAnalyticsTracker";
import { getOptionalPublicEnv } from "@/lib/env";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { gaId } = getOptionalPublicEnv();

  return (
    <>
      <PublicAnalyticsTracker />
      <PublicShell>{children}</PublicShell>
      <PopAdsScript />
      {gaId && <><Script async strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} /><Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId.replace(/'/g, "")}');`}</Script></>}
    </>
  );
}
