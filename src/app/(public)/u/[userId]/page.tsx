import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityAvatar } from "@/features/community/components/CommunityAvatar";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface PageProps { params: Promise<{ userId: string }> }

type EpisodeInfo = { id: string; title: string; slug: string; series_id: string };
type SeriesInfo = { id: string; slug: string };

export default async function PublicProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const supabase = await createServerSupabaseClient();
  const [{ data: profile }, { data: comments, count }] = await Promise.all([
    supabase.from("community_profiles").select("user_id,display_name,avatar_url,bio,created_at").eq("user_id", userId).maybeSingle(),
    supabase.from("episode_comments").select("id,episode_id,body,like_count,created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
  ]);
  if (!profile) notFound();

  const rows = comments ?? [];
  const totalLikes = rows.reduce((sum, item) => sum + item.like_count, 0);
  const episodeIds = [...new Set(rows.map((item) => item.episode_id))];
  const { data: episodeRows } = episodeIds.length
    ? await supabase.from("episodes").select("id,title,slug,series_id").in("id", episodeIds)
    : { data: [] };
  const episodes = (episodeRows ?? []) as EpisodeInfo[];
  const seriesIds = [...new Set(episodes.map((item) => item.series_id))];
  const { data: seriesRows } = seriesIds.length
    ? await supabase.from("series").select("id,slug").in("id", seriesIds)
    : { data: [] };
  const episodeMap = new Map(episodes.map((item) => [item.id, item]));
  const seriesMap = new Map(((seriesRows ?? []) as SeriesInfo[]).map((item) => [item.id, item]));

  return (
    <div className="shell py-7 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-bold text-zinc-400 hover:text-white">← Beranda</Link>

        <section className="surface mt-3 rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <CommunityAvatar name={profile.display_name} avatarUrl={profile.avatar_url} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black tracking-[0.18em] text-red-400">PENONTON CERITARIA</p>
              <h1 className="mt-1 text-3xl font-black">{profile.display_name}</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{profile.bio || "Belum ada bio."}</p>
              <p className="mt-2 text-xs text-zinc-500">Bergabung {new Date(profile.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[var(--border)] p-4"><p className="text-2xl font-black">{count ?? 0}</p><p className="text-xs text-zinc-500">Komentar</p></div>
            <div className="rounded-2xl border border-[var(--border)] p-4"><p className="text-2xl font-black">{totalLikes}</p><p className="text-xs text-zinc-500">Like terbaru</p></div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-black sm:text-2xl">Komentar terbaru</h2>
          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">Belum ada komentar publik.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {rows.map((comment) => {
                const episode = episodeMap.get(comment.episode_id);
                const series = episode ? seriesMap.get(episode.series_id) : undefined;
                const href = episode && series ? `/series/${series.slug}/${episode.slug}#comments-title` : null;
                const card = (
                  <div className="surface rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3 text-xs text-zinc-500"><span>{episode?.title ?? "Episode"}</span><span>♥ {comment.like_count}</span></div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-200">{comment.body}</p>
                  </div>
                );
                return href ? <Link key={comment.id} href={href} className="block transition hover:opacity-90">{card}</Link> : <div key={comment.id}>{card}</div>;
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
