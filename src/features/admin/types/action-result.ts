export type ActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string };
