import Link from "next/link";

interface AdminSavedNoticeProps {
  kind: "Series" | "Episode";
  state?: string;
  publicPath?: string;
}

export function AdminSavedNotice({ kind, state, publicPath }: AdminSavedNoticeProps) {
  if (state !== "created" && state !== "updated") return null;
  const safePublicPath = publicPath?.startsWith("/") && !publicPath.startsWith("//") ? publicPath : null;

  return (
    <div role="status" className="mb-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-black text-white">✓</span>
        <div className="min-w-0">
          <p className="font-black">{kind} berhasil {state === "created" ? "dibuat" : "disimpan"}.</p>
          <p className="mt-0.5 break-words text-xs leading-5 text-emerald-700">Perubahanmu sudah aman tersimpan.</p>
        </div>
      </div>
      {safePublicPath && (
        <Link href={safePublicPath} target="_blank" rel="noopener noreferrer" className="min-h-10 shrink-0 rounded-lg border border-emerald-300 bg-white px-3 py-2.5 text-center text-xs font-black text-emerald-800 hover:bg-emerald-100">
          Lihat di website ↗
        </Link>
      )}
    </div>
  );
}
