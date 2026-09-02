import { z } from "zod";
import { facebookPermalinkSchema } from "@/features/episode/services/facebook-url";
import { youtubeVideoUrlSchema } from "@/features/episode/services/youtube-url";

const slug = z.string().trim().min(2, "Alamat halaman terlalu pendek").max(160, "Alamat halaman terlalu panjang").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda minus saja");
const optionalUrl = z.union([z.literal(""), z.url()]).transform((value) => value || null);
const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);

function parseDuration(value: string) {
  if (/^\d+$/.test(value)) return Number(value);
  if (!/^\d{1,3}:[0-5]\d$/.test(value)) return Number.NaN;
  const [minutes, seconds] = value.split(":").map(Number);
  return minutes * 60 + seconds;
}

const durationClock = z.string().trim().refine(
  (value) => value === "" || (Number.isFinite(parseDuration(value)) && parseDuration(value) > 0 && parseDuration(value) <= 86400),
  "Tulis durasi seperti 10:30 untuk 10 menit 30 detik",
).transform((value) => value ? parseDuration(value) : null);

export const seriesFormSchema = z.object({
  id: z.string().uuid().optional(),
  slug,
  title: z.string().trim().min(2, "Judul terlalu pendek").max(200, "Judul terlalu panjang"),
  shortSynopsis: optionalText(320),
  synopsis: optionalText(8000),
  genres: z.string().max(400),
  coverUrl: optionalUrl,
  heroUrl: optionalUrl,
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  seoTitle: optionalText(200),
  seoDescription: optionalText(320),
});

export const episodeFormSchema = z.object({
  id: z.string().uuid().optional(),
  seriesId: z.string().uuid(),
  episodeNumber: z.coerce.number().int().positive("Nomor episode harus lebih dari 0").max(10000),
  slug,
  title: z.string().trim().min(2, "Judul terlalu pendek").max(200, "Judul terlalu panjang"),
  shortSynopsis: optionalText(320),
  recap: optionalText(20000),
  highlights: z.string().max(4000),
  videoProvider: z.enum(["youtube", "facebook"]),
  videoUrl: z.string().trim().min(1, "Link video wajib diisi").max(2048),
  thumbnailUrl: optionalUrl,
  durationSeconds: durationClock,
  isPublished: z.boolean(),
  seoTitle: optionalText(200),
  seoDescription: optionalText(320),
}).superRefine((value, ctx) => {
  const schema = value.videoProvider === "youtube" ? youtubeVideoUrlSchema : facebookPermalinkSchema;
  if (!schema.safeParse(value.videoUrl).success) {
    ctx.addIssue({
      code: "custom",
      path: ["videoUrl"],
      message: value.videoProvider === "youtube"
        ? "Link YouTube belum dikenali. Coba salin ulang link videonya."
        : "Link video Facebook belum dikenali. Pastikan videonya dapat dibuka publik.",
    });
  }
});

export function splitCommaList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12);
}

export function splitLineList(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 12);
}
