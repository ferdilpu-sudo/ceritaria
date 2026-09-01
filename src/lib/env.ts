import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url().transform((value) => value.replace(/\/+$/, "")),
});

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}

export function getOptionalPublicEnv() {
  return {
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
    adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || null,
    adsenseSlotContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT || null,
    gaId: process.env.NEXT_PUBLIC_GA_ID || null,
  };
}
