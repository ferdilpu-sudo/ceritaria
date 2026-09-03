import "server-only";
import { getR2MediaEnv } from "@/features/admin/services/r2-media-env";
import { imageExtension, MEDIA_KIND_CONFIG, type AllowedImageType, type MediaKind } from "@/features/admin/services/media-upload-config";

const encoder = new TextEncoder();
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const EXPIRES_SECONDS = 300;

function encodeRfc3986(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodePath(value: string) {
  return value.split("/").map(encodeRfc3986).join("/");
}

function toHex(value: ArrayBuffer) {
  return [...new Uint8Array(value)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  return crypto.subtle.digest("SHA-256", encoder.encode(value));
}

async function hmac(key: ArrayBuffer, value: string) {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
}

async function signingKey(secret: string, date: string) {
  const initial = encoder.encode(`AWS4${secret}`).buffer as ArrayBuffer;
  const dateKey = await hmac(initial, date);
  const regionKey = await hmac(dateKey, "auto");
  const serviceKey = await hmac(regionKey, "s3");
  return hmac(serviceKey, "aws4_request");
}

function createObjectKey(kind: MediaKind, contentType: AllowedImageType, now: Date) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${MEDIA_KIND_CONFIG[kind].prefix}/${year}/${month}/${crypto.randomUUID()}.${imageExtension(contentType)}`;
}

export async function createR2UploadUrl(kind: MediaKind, contentType: AllowedImageType) {
  const env = getR2MediaEnv();
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const host = `${env.R2_ACCOUNT_ID.toLowerCase()}.r2.cloudflarestorage.com`;
  const key = createObjectKey(kind, contentType, now);
  const canonicalUri = `/${encodeRfc3986(env.R2_BUCKET_NAME)}/${encodePath(key)}`;
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const signedHeaders = "cache-control;content-type;host";

  const queryEntries = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${env.R2_ACCESS_KEY_ID}/${credentialScope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(EXPIRES_SECONDS)],
    ["X-Amz-SignedHeaders", signedHeaders],
  ] as const;
  const canonicalQuery = queryEntries
    .map(([name, value]) => [encodeRfc3986(name), encodeRfc3986(value)] as const)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${name}=${value}`)
    .join("&");

  const canonicalHeaders = `cache-control:${CACHE_CONTROL}\ncontent-type:${contentType}\nhost:${host}\n`;
  const canonicalRequest = ["PUT", canonicalUri, canonicalQuery, canonicalHeaders, signedHeaders, "UNSIGNED-PAYLOAD"].join("\n");
  const requestHash = toHex(await sha256(canonicalRequest));
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, requestHash].join("\n");
  const signature = toHex(await hmac(await signingKey(env.R2_SECRET_ACCESS_KEY, dateStamp), stringToSign));
  const objectPath = encodePath(key);

  return {
    uploadUrl: `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`,
    publicUrl: `${env.R2_PUBLIC_BASE_URL}/${objectPath}`,
    cacheControl: CACHE_CONTROL,
  };
}
