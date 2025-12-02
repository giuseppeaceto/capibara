import { notFound } from "next/navigation";
import { getPodcastEpisodeBySlug } from "@/lib/api";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import PodcastPlatformButtons from "@/components/PodcastPlatformButtons";

export default async function PodcastEpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = await getPodcastEpisodeBySlug(slug);

  if (!episode) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <Link
          href="/"
          className="back-link"
        >
          ← Torna alla home
        </Link>

        <article className="space-y-8">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-wide meta-text">
              <span>Podcast</span>
              {episode.isPremium && (
                <span className="locked-badge">
                  Abbonati
                </span>
              )}
            </div>
            <h1 className="page-title text-4xl font-semibold leading-tight">
              {episode.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm uppercase tracking-wide text-zinc-500">
              {episode.publishDate && (
                <p>
                  {new Date(episode.publishDate).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              {episode.durationSeconds && (
                <p>
                  {Math.floor(episode.durationSeconds / 60)} min
                </p>
              )}
            </div>
          </div>

          {episode.summary && (
            <p className="article-excerpt">{episode.summary}</p>
          )}

          <PodcastPlatformButtons
            spotifyLink={episode.spotifyLink}
            appleLink={episode.appleLink}
            youtubeLink={episode.youtubeLink}
          />
        </article>
      </div>
    </MainLayout>
  );
}

