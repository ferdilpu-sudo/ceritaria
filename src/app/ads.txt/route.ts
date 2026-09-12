import { ADSENSE_CERTIFICATION_AUTHORITY_ID, ADSENSE_PUBLISHER_ID } from "@/lib/adsense-config";

export function GET() {
  return new Response(
    `google.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, ${ADSENSE_CERTIFICATION_AUTHORITY_ID}\n`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
