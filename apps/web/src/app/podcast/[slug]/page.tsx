import { notFound } from "next/navigation";
import { getPodcastEpisodeBySlug, extractHeroImage, getStrapiMediaUrl } from "@/lib/api";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import PodcastPlatformButtons from "@/components/PodcastPlatformButtons";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getPodcastEpisodeBySlug(slug);

  if (!episode) {
    return {
      title: "Podcast non trovato",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.coop";
  const podcastUrl = `${siteUrl}/podcast/${slug}`;
  
  // Usa metaImage dal SEO se disponibile, altrimenti heroImage, altrimenti logo
  const seoImageUrl = episode.seo?.metaImage?.data?.attributes?.url
    ? getStrapiMediaUrl(episode.seo.metaImage.data.attributes.url)
    : null;
  const { url: heroImageUrl } = extractHeroImage(episode.heroImage);
  const finalImageUrl = seoImageUrl || heroImageUrl || `${siteUrl}/logo_capibara.png`;

  // Usa metaTitle dal SEO se disponibile, altrimenti title
  const metaTitle = episode.seo?.metaTitle || episode.title;
  
  // Usa metaDescription dal SEO se disponibile, altrimenti synopsis/summary
  const description = episode.seo?.metaDescription || episode.synopsis || episode.summary || "Ascolta il podcast completo su Capibara";

  // Se preventIndexing è true, aggiungi noindex
  const robots = episode.seo?.preventIndexing
    ? { index: false, follow: false }
    : { index: true, follow: true };

  return {
    title: metaTitle,
    description,
    robots,
    openGraph: {
      type: "music.song",
      locale: "it_IT",
      url: podcastUrl,
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
      card: "summary_large_image",
      title: metaTitle,
      description,
      images: [finalImageUrl],
    },
    alternates: {
      canonical: podcastUrl,
    },
  };
}

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.coop";
  const podcastPageUrl = `${siteUrl}/podcast/${slug}`;
  const { url: imageUrl } = extractHeroImage(episode.heroImage);
  const finalImageUrl = imageUrl || `${siteUrl}/logo_capibara.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: episode.title,
    description: episode.synopsis || episode.summary || "",
    image: finalImageUrl,
    datePublished: episode.publishDate || undefined,
    duration: episode.durationSeconds
      ? `PT${Math.floor(episode.durationSeconds / 60)}M${episode.durationSeconds % 60}S`
      : undefined,
    partOfSeries: {
      "@type": "PodcastSeries",
      name: episode.show?.data?.attributes?.title || "Capibara Podcast",
    },
    publisher: {
      "@type": "Organization",
      name: "Capibara",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo_capibara.png`,
      },
    },
    ...(episode.spotifyLink && {
      associatedMedia: {
        "@type": "MediaObject",
        contentUrl: episode.spotifyLink,
      },
    }),
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

