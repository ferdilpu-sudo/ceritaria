import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import { getLatestEpisodes } from "@/features/episode/services/public-episodes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ceritaria di TikTok",
  description: "Temukan episode terbaru Ceritaria dari TikTok.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function TikTokLandingPage() {
  const [latest] = await getLatestEpisodes(1);
  const watchHref = latest ? `/series/${latest.seriesSlug}/${latest.slug}` : "/";

  return (
    <main className="min-h-dvh bg-[#09090d] px-4 py-6 text-white sm:py-10">
      <div className="mx-auto w-full max-w-[440px]">
        <header className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Ceritaria beranda">
            <Image src="/brand/ceritaria-mark.svg" alt="" width={46} height={52} priority className="h-12 w-auto" />
            <div className="text-left">
              <p className="font-serif text-2xl font-semibold leading-none tracking-[-0.04em] text-[#fff7f4]">Ceritaria</p>
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Setiap cerita, selalu berarti</p>
            </div>
          </Link>
          <p className="mt-5 text-sm leading-6 text-zinc-400">Mini drama pendek untuk kamu yang selalu bilang “satu episode lagi”.</p>
        </header>

        <section className="mt-7 overflow-hidden rounded-[28px] border border-white/10 bg-[#14141b] shadow-2xl shadow-black/30">
          <div className="px-4 pb-3 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-400">Episode terbaru</p>
            <h1 className="mt-1 text-2xl font-black leading-tight">
              {latest ? `${latest.seriesTitle} — Episode ${latest.episode_number}` : "Ceritaria"}
            </h1>
          </div>

          <a
            href={watchHref}
            className="group relative block aspect-[4/5] overflow-hidden bg-zinc-950"
            aria-label="Tonton episode terbaru"
          >
            <MediaImage
              src={latest?.thumbnail_url ?? null}
              alt={latest ? `Poster ${latest.title}` : "Ceritaria"}
              priority
              sizes="(max-width: 480px) calc(100vw - 32px), 440px"
              className="transition duration-300 group-active:scale-[0.99]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-lg font-black leading-snug">{latest?.title ?? "Tonton Ceritaria"}</p>
            </div>
          </a>

          <div className="p-4">
            {latest?.short_synopsis && <p className="line-clamp-3 text-sm leading-6 text-zinc-300">{latest.short_synopsis}</p>}

            <Link
              href={watchHref}
              className="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--primary)] px-5 text-base font-black text-white shadow-lg shadow-red-950/30 transition active:scale-[0.985]"
            >
              ▶ Tonton Episode
            </Link>

          </div>
        </section>

        <footer className="px-3 pb-4 pt-5 text-center">
          <Link href="/" className="mt-3 inline-flex min-h-11 items-center px-3 text-xs font-bold text-zinc-400">Buka Ceritaria →</Link>
        </footer>
      </div>
    </main>
  );
}
