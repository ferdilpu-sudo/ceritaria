import { z } from "zod";
import { facebookPermalinkSchema } from "@/features/episode/services/facebook-url";
import { youtubeVideoUrlSchema } from "@/features/episode/services/youtube-url";

const slug = z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug harus lowercase-kebab-case");
const optionalUrl = z.union([z.literal(""), z.url()]).transform((value) => value || null);
const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);

export const seriesFormSchema = z.object({
  id: z.string().uuid().optional(),
  slug,
  title: z.string().trim().min(2).max(200),
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
  episodeNumber: z.coerce.number().int().positive().max(10000),
  slug,
  title: z.string().trim().min(2).max(200),
  shortSynopsis: optionalText(320),
  recap: optionalText(20000),
  highlights: z.string().max(4000),
  videoProvider: z.enum(["youtube", "facebook"]),
  videoUrl: z.string().trim().min(1).max(2048),
  thumbnailUrl: optionalUrl,
  durationSeconds: z.union([z.literal(""), z.coerce.number().int().positive().max(86400)]).transform((v) => v === "" ? null : v),
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
        ? "Gunakan URL YouTube yang valid"
        : "Gunakan permalink video Facebook Public yang valid",
    });
  }
});

export function splitCommaList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12);
}

export function splitLineList(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 12);
}
