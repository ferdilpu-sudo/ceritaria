import "server-only";
import { revalidatePath } from "next/cache";

export function refreshPublicPaths(paths: Array<string | null | undefined>) {
  for (const path of new Set(paths.filter((value): value is string => Boolean(value)))) {
    try {
      revalidatePath(path);
    } catch (error) {
      console.warn("Public cache refresh skipped", path, error instanceof Error ? error.message : "unknown error");
    }
  }
}
