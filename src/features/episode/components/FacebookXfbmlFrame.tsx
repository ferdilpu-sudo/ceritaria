"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

interface FacebookXfbmlFrameProps {
  permalink: string;
  width?: number;
  className?: string;
}

type FacebookSdkWindow = Window & {
  FB?: {
    XFBML?: {
      parse: (element?: HTMLElement) => void;
    };
  };
};

function parseFacebookEmbed(element: HTMLElement | null) {
  if (!element) return;
  (window as FacebookSdkWindow).FB?.XFBML?.parse(element);
}

export function FacebookXfbmlFrame({
  permalink,
  width = 480,
  className,
}: FacebookXfbmlFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => parseFacebookEmbed(rootRef.current), 0);
    return () => window.clearTimeout(timer);
  }, [permalink]);

  return (
    <>
      <div ref={rootRef} className={className}>
        <div
          className="fb-video h-full w-full"
          data-href={permalink}
          data-width={String(width)}
          data-show-text="false"
          data-allowfullscreen="true"
        />
      </div>

      <Script
        id="facebook-sdk"
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v25.0"
        strategy="afterInteractive"
        onReady={() => parseFacebookEmbed(rootRef.current)}
      />
    </>
  );
}
