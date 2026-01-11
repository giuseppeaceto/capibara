import { getVideoEpisodes, getLatestVideoEpisodes, extractHeroImage, getStrapiMediaUrl } from "@/lib/api";
import MainLayout from "@/components/MainLayout";
import ContentCard, { formatDate, getKindAccent } from "@/components/ContentCard";
import type { Show } from "@/lib/api";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";
  
  // Helper per garantire URL assoluto per Open Graph
  const ensureAbsoluteUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return url.startsWith("/") ? `${siteUrl}${url}` : `${siteUrl}/${url}`;
  };
  
  // Ottieni il primo video per usare la sua immagine come anteprima
  const latestVideos = await getLatestVideoEpisodes(1);
  let ogImage = `${siteUrl}/logo_capibara.png`;
  
  if (latestVideos.length > 0 && latestVideos[0]?.heroImage) {
    const { url } = extractHeroImage(latestVideos[0].heroImage);
    const absoluteUrl = ensureAbsoluteUrl(url);
    if (absoluteUrl) {
      ogImage = absoluteUrl;
    }
  }
  
  return {
    metadataBase: new URL(siteUrl),
    title: "Video",
    description: "Tutti gli episodi video di Capibara Originals: documentari, interviste e reportage su lavoro, diritti e conflitti sociali.",
    openGraph: {
      type: "website",
      locale: "it_IT",
      url: `${siteUrl}/video`,
      siteName: "Capibara",
      title: "Video | Capibara",
      description: "Tutti gli episodi video di Capibara Originals: documentari, interviste e reportage su lavoro, diritti e conflitti sociali.",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Video Capibara",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Video | Capibara",
      description: "Tutti gli episodi video di Capibara Originals: documentari, interviste e reportage su lavoro, diritti e conflitti sociali.",
      images: [ogImage],
    },
  };
}

export default async function VideoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const { data: episodes, pagination } = await getVideoEpisodes(page, 12);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="page-title text-4xl font-semibold">Video</h1>
          <p className="body-text mt-2">
            Tutti gli episodi video di Capibara Originals
          </p>
        </div>

        {episodes.length === 0 ? (
          <div className="content-box p-12 text-center">
            <p className="body-text">Nessun video disponibile al momento.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {episodes.map((episode) => {
                const showData = episode.show?.data;
                const showKind = 
                  (showData?.attributes?.kind as Show["kind"]) ?? "video";
                const accent = getKindAccent(showKind);

                const { url: imageUrl, alt: imageAltRaw } = extractHeroImage(episode.heroImage);
                const imageAlt = imageAltRaw ?? episode.title;

                return (
                  <ContentCard
                    key={episode.slug}
                    entry={{
                      title: episode.title ?? "Untitled",
                      date: formatDate(episode.publishDate),
                      summary: episode.synopsis ?? episode.summary ?? "",
                      tag: "Video",
                      accent,
                      imageUrl: imageUrl ?? undefined,
                      imageAlt,
                      locked: episode.isPremium ?? false,
                      slug: episode.slug,
                      type: "video",
                      borderColor: "purple-500",
                    }}
                  />
                );
              })}
            </div>

            {pagination.pageCount > 1 && (
              <div className="flex items-center justify-center gap-4">
                {pagination.page > 1 && (
                  <Link
                    href={`/video?page=${pagination.page - 1}`}
                    className="pagination-button"
                  >
                    ← Precedente
                  </Link>
                )}
                <span className="text-sm text-zinc-500">
                  Pagina {pagination.page} di {pagination.pageCount}
                </span>
                {pagination.page < pagination.pageCount && (
                  <Link
                    href={`/video?page=${pagination.page + 1}`}
                    className="pagination-button"
                  >
                    Successiva →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

