export const dynamic = "force-dynamic";
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!client) return new Response("Not configured", { status: 404, headers: { "Cache-Control": "no-store" } });
  const publisher = client.replace(/^ca-/, "");
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
