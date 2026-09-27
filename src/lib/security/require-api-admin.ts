import "server-only";
import type { User } from "@supabase/supabase-js";
import { createBearerSupabaseClient } from "@/lib/supabase/bearer";

export class ApiAuthorizationError extends Error {
  constructor(
    readonly status: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "ApiAuthorizationError";
  }
}

export function parseBearerToken(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const match = /^Bearer\s+(.+)$/i.exec(headerValue.trim());
  const token = match?.[1]?.trim();
  return token || null;
}

export async function requireApiAdmin(request: Request) {
  const accessToken = parseBearerToken(request.headers.get("authorization"));
  if (!accessToken) {
    throw new ApiAuthorizationError(401, "Missing bearer token");
  }

  const supabase = createBearerSupabaseClient(accessToken);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) {
    throw new ApiAuthorizationError(401, "Invalid bearer token");
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) throw new Error("Admin authorization lookup failed");
  if (!admin) {
    throw new ApiAuthorizationError(403, "Admin access required");
  }

  return { supabase, user: user as User, accessToken };
}
