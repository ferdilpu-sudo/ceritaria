const defaultAdsenseClientId = "ca-pub-6803477745163482";

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || defaultAdsenseClientId;
  const publisher = client.replace(/^ca-/, "");

  return new Response(
    `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
