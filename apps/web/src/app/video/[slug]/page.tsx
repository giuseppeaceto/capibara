import { notFound } from "next/navigation";
import { getVideoEpisodeBySlug } from "@/lib/api";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { toYoutubeEmbedUrl } from "@/lib/youtube";

export default async function VideoEpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = await getVideoEpisodeBySlug(slug);

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
              <span>Video</span>
              {episode.isPremium && (
                <span className="locked-badge">
                  Abbonati
                </span>
              )}
            </div>
            <h1 className="page-title text-4xl font-semibold leading-tight">
              {episode.title}
            </h1>
            {episode.publishDate && (
              <p className="mt-4 text-sm uppercase tracking-wide text-zinc-500">
                {new Date(episode.publishDate).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {episode.synopsis && (
            <p className="article-excerpt">{episode.synopsis}</p>
          )}

          {toYoutubeEmbedUrl(episode.videoUrl) && (
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <iframe
                src={toYoutubeEmbedUrl(episode.videoUrl) ?? undefined}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {episode.summary && (
            <div className="article-prose">
              <p>{episode.summary}</p>
            </div>
          )}
        </article>
      </div>
    </MainLayout>
  );
}

