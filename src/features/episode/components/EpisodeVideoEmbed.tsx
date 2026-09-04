import { FacebookVideoEmbed } from "@/features/episode/components/FacebookVideoEmbed";
import { YouTubeVideoEmbed } from "@/features/episode/components/YouTubeVideoEmbed";
import { facebookPermalinkSchema } from "@/features/episode/services/facebook-url";
import { getYouTubeVideoId } from "@/features/episode/services/youtube-url";
import type { VideoProvider } from "@/types/database.types";

interface EpisodeVideoEmbedProps {
  provider: VideoProvider;
  videoUrl: string;
  thumbnailUrl: string | null;
  title: string;
  episodeId: string;
  autoStart?: boolean;
  nextHref?: string;
  nextTitle?: string;
}

export function EpisodeVideoEmbed({ provider, videoUrl, thumbnailUrl, title, episodeId, autoStart, nextHref, nextTitle }: EpisodeVideoEmbedProps) {
  const isYouTube = provider === "youtube" && getYouTubeVideoId(videoUrl) !== null;
  const isFacebook = provider === "facebook" && facebookPermalinkSchema.safeParse(videoUrl).success;

  if (isYouTube) {
    return <YouTubeVideoEmbed key={episodeId} videoUrl={videoUrl} thumbnailUrl={thumbnailUrl} title={title} episodeId={episodeId} autoStart={autoStart} nextHref={nextHref} nextTitle={nextTitle} />;
  }

  if (isFacebook) {
    return <FacebookVideoEmbed key={episodeId} permalink={videoUrl} thumbnailUrl={thumbnailUrl} title={title} episodeId={episodeId} />;
  }

  return (
    <div className="mx-auto grid aspect-[9/16] w-full max-w-none place-items-center border-y border-red-900 bg-red-950/20 p-6 text-center sm:max-w-[480px] sm:rounded-2xl sm:border">
      <div>
        <p className="font-bold text-red-300">Video belum bisa diputar</p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Ada masalah pada sumber video episode ini. Coba lagi nanti.</p>
      </div>
    </div>
  );
}
