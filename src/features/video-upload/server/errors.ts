import { ZodError } from "zod";
import { ApiAuthorizationError } from "@/lib/security/require-api-admin";
import { VideoUploadPolicyError } from "@/lib/r2/upload-policy";

export class VideoUploadRequestError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
    this.name = "VideoUploadRequestError";
  }
}

export function videoUploadErrorResponse(error: unknown): Response {
  if (error instanceof ApiAuthorizationError) {
    return Response.json(
      { error: error.status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN" },
      { status: error.status },
    );
  }

  if (error instanceof VideoUploadPolicyError) {
    const status =
      error.code === "FILE_TOO_LARGE" ||
      error.code === "MULTIPART_LIMIT_EXCEEDED"
        ? 413
        : 400;
    return Response.json({ error: error.code }, { status });
  }

  if (error instanceof VideoUploadRequestError) {
    return Response.json({ error: error.code }, { status: error.status });
  }

  if (error instanceof ZodError || error instanceof SyntaxError) {
    return Response.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  return Response.json({ error: "VIDEO_UPLOAD_INTERNAL_ERROR" }, { status: 500 });
}
