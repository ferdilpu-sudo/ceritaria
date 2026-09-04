interface Props {
  comments: number;
  members: number;
  likes: number;
  reactions: number;
  votes: number;
  reports: number;
}

const items = [
  ["comments", "Komentar"],
  ["members", "Member"],
  ["likes", "Like komentar"],
  ["reactions", "Reaksi episode"],
  ["votes", "Suara prediksi"],
  ["reports", "Laporan"],
] as const;

export function CommunityStatsCards(props: Props) {
  return (
    <section aria-label="Statistik komunitas" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {items.map(([key, label]) => (
        <div key={key} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-2xl font-black text-[var(--text)]">{props[key].toLocaleString("id-ID")}</p>
          <p className="mt-1 text-xs font-bold text-[var(--muted)]">{label}</p>
        </div>
      ))}
    </section>
  );
}
