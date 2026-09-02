import type { ZodError } from "zod";

export function zodFieldErrors(error: ZodError) {
  const entries = error.issues
    .filter((issue) => typeof issue.path[0] === "string")
    .map((issue) => [String(issue.path[0]), issue.message] as const);

  return Object.fromEntries(entries);
}
