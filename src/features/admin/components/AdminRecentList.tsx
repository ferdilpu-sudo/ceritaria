import Link from "next/link";

export interface AdminRecentItem {
  id: string;
  title: string;
  meta: string;
  href: string;
  published: boolean;
  badge?: string;
}

interface AdminRecentListProps {
  title: string;
  eyebrow: string;
  items: AdminRecentItem[];
  manageHref: string;
  emptyText: string;
}

function badgeClassName(badge?: string) {
  switch (badge) {
    case "FEATURED":
      return "border border-rose-200 bg-rose-50 text-rose-700";
    case "YOUTUBE":
      return "border border-red-200 bg-red-50 text-red-700";
    case "FACEBOOK":
      return "border border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border border-zinc-200 bg-zinc-100 text-zinc-700";
  }
}

export function AdminRecentList({ title, eyebrow, items, manageHref, emptyText }: AdminRecentListProps) {
  return (
    <section className="surface rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black tracking-[0.18em] text-red-600">{eyebrow}</p>
          <h2 className="mt-0.5 text-lg font-black text-[var(--text)]">{title}</h2>
        </div>
        <Link href={manageHref} className="min-h-10 shrink-0 rounded-lg px-2 py-2.5 text-sm font-bold text-[var(--muted)] hover:text-[var(--text)]">
          Kelola →
        </Link>
      </div>

      <div className="mt-3 divide-y divide-[var(--border)]">
        {items.length ? (
          items.map((item) => (
            <Link key={item.id} href={item.href} className="group flex min-h-14 items-center gap-2.5 py-2.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${item.published ? "bg-emerald-500" : "bg-zinc-400"}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-bold text-[var(--text)] group-hover:text-red-700">{item.title}</p>
                  {item.badge && (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black tracking-wide ${badgeClassName(item.badge)}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">{item.meta}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${item.published ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-zinc-200 bg-zinc-100 text-zinc-600"}`}>
                {item.published ? "PUBLISHED" : "DRAFT"}
              </span>
            </Link>
          ))
        ) : (
          <p className="py-5 text-sm text-[var(--muted)]">{emptyText}</p>
        )}
      </div>
    </section>
  );
}
