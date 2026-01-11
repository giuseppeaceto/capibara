import { getArticles, getLatestArticles, extractHeroImage, getStrapiMediaUrl } from "@/lib/api";
import MainLayout from "@/components/MainLayout";
import ContentCard, { formatDate } from "@/components/ContentCard";
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
  
  // Ottieni il primo articolo per usare la sua immagine come anteprima
  const latestArticles = await getLatestArticles(1);
  let ogImage = `${siteUrl}/logo_capibara.png`;
  
  if (latestArticles.length > 0 && latestArticles[0]?.heroImage) {
    const { url } = extractHeroImage(latestArticles[0].heroImage);
    const absoluteUrl = ensureAbsoluteUrl(url);
    if (absoluteUrl) {
      ogImage = absoluteUrl;
    }
  }
  
  return {
    metadataBase: new URL(siteUrl),
    title: "Articoli",
    description: "Approfondimenti, analisi e articoli editoriali su lavoro, diritti, conflitti sociali e nuove forme di organizzazione.",
    openGraph: {
      type: "website",
      locale: "it_IT",
      url: `${siteUrl}/articoli`,
      siteName: "Capibara",
      title: "Articoli | Capibara",
      description: "Approfondimenti, analisi e articoli editoriali su lavoro, diritti, conflitti sociali e nuove forme di organizzazione.",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Articoli Capibara",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Articoli | Capibara",
      description: "Approfondimenti, analisi e articoli editoriali su lavoro, diritti, conflitti sociali e nuove forme di organizzazione.",
      images: [ogImage],
    },
  };
}

export default async function ArticoliPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const { data: articles, pagination } = await getArticles(page, 12);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="page-title text-4xl font-semibold">Articoli</h1>
          <p className="body-text mt-2">
            Approfondimenti, analisi e articoli editoriali
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="content-box p-12 text-center">
            <p className="body-text">Nessun articolo disponibile al momento.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => {
                const { url, alt } = extractHeroImage(article.heroImage);
                // Estrai il nome dell'autore da diverse possibili strutture
                const authorName = 
                  article.author?.data?.attributes?.name ||
                  (article.author as any)?.attributes?.name ||
                  (article.author as any)?.name ||
                  null;

                // Debug in development
                if (process.env.NODE_ENV === 'development' && !authorName && article.author) {
                  console.log('Article author structure:', {
                    slug: article.slug,
                    author: article.author,
                    authorData: (article.author as any)?.data,
                    authorAttributes: (article.author as any)?.data?.attributes,
                  });
                }

                return (
                  <ContentCard
                    key={article.slug}
                    entry={{
                      title: article.title ?? "Untitled",
                      date: formatDate(article.publishDate),
                      summary: article.excerpt ?? "",
                      tag: "Articolo",
                      accent: "from-blue-500/30 via-indigo-500/20 to-purple-900/40",
                      imageUrl: url ?? undefined,
                      imageAlt: alt ?? article.title,
                      locked: article.isPremium ?? false,
                      slug: article.slug,
                      type: "article",
                      borderColor: "indigo-500",
                      authorName: authorName,
                    }}
                  />
                );
              })}
            </div>

            {pagination.pageCount > 1 && (
              <div className="flex items-center justify-center gap-4">
                {pagination.page > 1 && (
                  <Link
                    href={`/articoli?page=${pagination.page - 1}`}
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
                    href={`/articoli?page=${pagination.page + 1}`}
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

