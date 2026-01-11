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
  
  // Helper per garantire URL assoluto per Open Graph
  const ensureAbsoluteUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // Se è un path relativo, costruisci URL assoluto
    return url.startsWith("/") ? `${siteUrl}${url}` : `${siteUrl}/${url}`;
  };
  
  // Usa metaImage dal SEO se disponibile, altrimenti heroImage, altrimenti logo
  const seoImageUrl = episode.seo?.metaImage?.data?.attributes?.url
    ? ensureAbsoluteUrl(getStrapiMediaUrl(episode.seo.metaImage.data.attributes.url))
    : null;
  const { url: heroImageUrl } = extractHeroImage(episode.heroImage);
  const finalImageUrl = seoImageUrl || ensureAbsoluteUrl(heroImageUrl) || `${siteUrl}/logo_capibara.png`;

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

  const isVertical = episode.videoOrientation === "vertical";
  const embedSrc = toYoutubeEmbedUrl(episode.videoUrl) ?? episode.videoUrl ?? undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: episode.title,
    description: episode.synopsis || episode.summary || "",
    thumbnailUrl: finalImageUrl,
    uploadDate: episode.publishDate || undefined,
    contentUrl: episode.videoUrl,
    // Preferisci l'embed YouTube se riconosciuto, altrimenti usa direttamente l'URL originale (es. Cloudinary)
    embedUrl: toYoutubeEmbedUrl(episode.videoUrl) || episode.videoUrl || undefined,
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

          {episode.synopsis && <p className="article-excerpt">{episode.synopsis}</p>}

          {embedSrc && (
            <div
              className={`overflow-hidden rounded-2xl bg-black ${
                isVertical ? "mx-auto max-w-sm aspect-[9/16]" : "w-full aspect-video"
              }`}
            >
              <iframe
                // Se è un URL YouTube lo convertiamo a embed, altrimenti usiamo l'URL così com'è (es. Cloudinary embed/player)
                src={embedSrc}
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

