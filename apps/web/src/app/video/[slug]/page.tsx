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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";
  const videoUrl = `${siteUrl}/video/${slug}`;
  
  // Usa metaImage dal SEO se disponibile, altrimenti heroImage, altrimenti logo
  const seoImageUrl = episode.seo?.metaImage?.data?.attributes?.url
    ? getStrapiMediaUrl(episode.seo.metaImage.data.attributes.url)
    : null;
  const { url: heroImageUrl } = extractHeroImage(episode.heroImage);
  const finalImageUrl = seoImageUrl || heroImageUrl || `${siteUrl}/logo_capibara.png`;

  // Usa metaTitle dal SEO se disponibile, altrimenti title
  const metaTitle = episode.seo?.metaTitle || episode.title;
  
  // Usa metaDescription dal SEO se disponibile, altrimenti synopsis/summary
  const description = episode.seo?.metaDescription || episode.synopsis || episode.summary || "Guarda il video completo su Capibara";

  // Se preventIndexing è true, aggiungi noindex
  const robots = episode.seo?.preventIndexing
    ? { index: false, follow: false }
    : { index: true, follow: true };

  return {
    metadataBase: new URL(siteUrl),
    title: metaTitle,
    description,
    robots,
    openGraph: {
      type: "video.other",
      locale: "it_IT",
      url: videoUrl,
      siteName: "Capibara",
      title: metaTitle,
      description,
      images: [
        {
          url: finalImageUrl,
          width: 1200,
          height: 630,
          alt: episode.seo?.metaImage?.data?.attributes?.alternativeText || episode.title,
        },
      ],
    },
    twitter: {
      card: "player",
      title: metaTitle,
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";
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

