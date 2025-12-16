import { notFound } from "next/navigation";
import { getVideoEpisodeBySlug, getStrapiMediaUrl, extractHeroImage } from "@/lib/api";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { toYoutubeEmbedUrl } from "@/lib/youtube";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getVideoEpisodeBySlug(slug);

  if (!episode) {
    return {
      title: "Video non trovato",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.coop";
  const videoUrl = `${siteUrl}/video/${slug}`;
  const { url: imageUrl } = extractHeroImage(episode.heroImage);
  const finalImageUrl = imageUrl || `${siteUrl}/logo_capibara.png`;

  const description = episode.synopsis || episode.summary || "Guarda il video completo su Capibara";

  return {
    title: episode.title,
    description,
    openGraph: {
      type: "video.other",
      locale: "it_IT",
      url: videoUrl,
      siteName: "Capibara",
      title: episode.title,
      description,
      images: [
        {
          url: finalImageUrl,
          width: 1200,
          height: 630,
          alt: episode.title,
        },
      ],
    },
    twitter: {
      card: "player",
      title: episode.title,
      description,
      images: [finalImageUrl],
    },
    alternates: {
      canonical: videoUrl,
    },
  };
}

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.coop";
  const videoPageUrl = `${siteUrl}/video/${slug}`;
  const { url: imageUrl } = extractHeroImage(episode.heroImage);
  const finalImageUrl = imageUrl || `${siteUrl}/logo_capibara.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: episode.title,
    description: episode.synopsis || episode.summary || "",
    thumbnailUrl: finalImageUrl,
    uploadDate: episode.publishDate || undefined,
    contentUrl: episode.videoUrl,
    embedUrl: toYoutubeEmbedUrl(episode.videoUrl) || episode.videoUrl,
    duration: episode.durationSeconds
      ? `PT${Math.floor(episode.durationSeconds / 60)}M${episode.durationSeconds % 60}S`
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Capibara",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo_capibara.png`,
      },
    },
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

