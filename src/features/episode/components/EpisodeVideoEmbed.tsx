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
}

export function EpisodeVideoEmbed({
  provider,
  videoUrl,
  thumbnailUrl,
  title,
  episodeId,
}: EpisodeVideoEmbedProps) {
  const isYouTube = getYouTubeVideoId(videoUrl) !== null;
  const isFacebook = facebookPermalinkSchema.safeParse(videoUrl).success;

  if (isYouTube) {
    return (
      <YouTubeVideoEmbed
        videoUrl={videoUrl}
        thumbnailUrl={thumbnailUrl}
        title={title}
        episodeId={episodeId}
      />
    );
  }

  if (isFacebook) {
    return (
      <FacebookVideoEmbed
        permalink={videoUrl}
        thumbnailUrl={thumbnailUrl}
        title={title}
        episodeId={episodeId}
      />
    );
  }

  return (
    <div className="mx-auto grid aspect-[9/16] w-full max-w-[480px] place-items-center rounded-2xl border border-red-900 bg-red-950/20 p-6 text-center">
      <div>
        <p className="font-bold text-red-300">Video tidak dapat diputar</p>
        <p className="mt-2 text-sm text-zinc-400">URL video episode ini tidak valid.</p>
        <p className="mt-1 text-xs text-zinc-500">Provider tersimpan: {provider}</p>
      </div>
    </div>
  );
}
