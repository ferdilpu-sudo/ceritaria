"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEpisodeAction } from "@/features/admin/actions/episode-actions";
import { deleteSeriesAction } from "@/features/admin/actions/series-actions";

export function DeleteContentButton({ id, kind }: { id: string; kind: "series" | "episode" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Soft-delete ${kind} ini?`)) return;
    setBusy(true);
    const result = kind === "series" ? await deleteSeriesAction(id) : await deleteEpisodeAction(id);
    setBusy(false);
    if (!result.ok) return window.alert(result.message);
    router.push(result.redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="min-h-11 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
    >
      {busy ? "Menghapus..." : "Hapus"}
    </button>
  );
}
