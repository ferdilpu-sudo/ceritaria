interface AdminSavedNoticeProps {
  kind: "Series" | "Episode";
  state?: string;
}

export function AdminSavedNotice({ kind, state }: AdminSavedNoticeProps) {
  if (state !== "created" && state !== "updated") return null;

  return (
    <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-black text-white">✓</span>
      <div>
        <p className="font-black">{kind} berhasil {state === "created" ? "dibuat" : "disimpan"}.</p>
        <p className="mt-0.5 text-xs text-emerald-700">Perubahan sudah tersimpan dan cache konten telah diperbarui.</p>
      </div>
    </div>
  );
}
