import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

type NextFetchInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

export function createPublicClient() {
  const env = getPublicEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => {
        const nextInit: NextFetchInit = { ...init, next: { revalidate: 300, tags: ["public-content"] } };
        return fetch(input, nextInit);
      },
    },
  });
}
