"use client";

import Script from "next/script";

const POPADS_SCRIPT = String.raw`
/*<![CDATA[/* */
(function(){var b=window,n="a637bb39675acd918e1298b99c051367",m=[["siteId",638+632-203+5318774],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],i=["d3d3LmFudGlhZGJsb2Nrc3lzdGVtcy5jb20vUFhiSlAvZ2FsbHkubWluLmpz","ZDNjb2Q4MHRobjdxbmQuY2xvdWRmcm9udC5uZXQvVkxPQy9ncm1waHIvb29wZW5mbC5taW4uY3Nz"],h=-1,k,j,v=function(){clearTimeout(j);h++;if(i[h]&&!(1816875912000<(new Date).getTime()&&1<h)){k=b.document.createElement("script");k.type="text/javascript";k.async=!0;var e=b.document.getElementsByTagName("script")[0];k.src="https://"+atob(i[h]);k.crossOrigin="anonymous";k.onerror=v;k.onload=function(){clearTimeout(j);b[n.slice(0,16)+n.slice(0,16)]||v()};j=setTimeout(v,5E3);e.parentNode.insertBefore(k,e)}};if(!b[n]){try{Object.freeze(b[n]=m)}catch(e){}v()}})();
/*]]>/* */
`;

export function PopAdsScript() {
  return (
    <Script
      id="ceritaria-popads"
      type="text/javascript"
      data-cfasync="false"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: POPADS_SCRIPT }}
    />
  );
}
