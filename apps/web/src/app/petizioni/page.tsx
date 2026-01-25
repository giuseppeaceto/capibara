import { getPetitions, extractHeroImage, getStrapiMediaUrl } from "@/lib/api";
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
  
  // Ottieni la prima petizione per usare la sua immagine come anteprima
  const { data: latestPetitions } = await getPetitions(1, 1);
  let ogImage = `${siteUrl}/logo_capibara.png`;
  
  if (latestPetitions.length > 0 && latestPetitions[0]?.heroImage) {
    const { url } = extractHeroImage(latestPetitions[0].heroImage);
    const absoluteUrl = ensureAbsoluteUrl(url);
    if (absoluteUrl) {
      ogImage = absoluteUrl;
    }
  }
  
  return {
    metadataBase: new URL(siteUrl),
    title: "Petizioni",
    description: "Petizioni e campagne di raccolta firme su lavoro, diritti, conflitti sociali e nuove forme di organizzazione.",
    openGraph: {
      type: "website",
      locale: "it_IT",
      url: `${siteUrl}/petizioni`,
      siteName: "Capibara",
      title: "Petizioni | Capibara",
      description: "Petizioni e campagne di raccolta firme su lavoro, diritti, conflitti sociali e nuove forme di organizzazione.",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Petizioni Capibara",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Petizioni | Capibara",
      description: "Petizioni e campagne di raccolta firme su lavoro, diritti, conflitti sociali e nuove forme di organizzazione.",
      images: [ogImage],
    },
  };
}

export default async function PetizioniPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const { data: petitions, pagination } = await getPetitions(page, 12);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="page-title text-4xl font-semibold">Petizioni</h1>
          <p className="body-text mt-2">
            Campagne di raccolta firme su lavoro, diritti e conflitti sociali
          </p>
        </div>

        {petitions.length === 0 ? (
          <div className="content-box p-12 text-center">
            <p className="body-text">Nessuna petizione disponibile al momento.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {petitions.map((petition) => {
                const { url, alt } = extractHeroImage(petition.heroImage);
                // Estrai il nome dell'autore da diverse possibili strutture
                const authorName = 
                  petition.author?.data?.attributes?.name ||
                  (petition.author as any)?.attributes?.name ||
                  (petition.author as any)?.name ||
                  null;
                
                // Estrai l'avatar dell'autore
                const authorAvatarData = 
                  petition.author?.data?.attributes?.avatar ||
                  (petition.author as any)?.attributes?.avatar ||
                  (petition.author as any)?.avatar ||
                  null;
                const { url: authorAvatarUrl } = extractHeroImage(authorAvatarData);

                // Calcola la percentuale di completamento
                const targetSignatures = petition.targetSignatures || 1000;
                const currentSignatures = petition.currentSignatures || 0;
                const percentage = Math.min(100, Math.round((currentSignatures / targetSignatures) * 100));

                return (
                  <Link
                    key={petition.slug}
                    href={`/petizioni/${petition.slug}`}
                    className="content-box overflow-hidden hover:border-zinc-900 dark:hover:border-zinc-100 transition-all duration-200 group block p-0"
                  >
                    {url && (
                      <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <img
                          src={url}
                          alt={alt ?? petition.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        <span>Petizione</span>
                        {petition.publishDate && (
                          <>
                            <span>•</span>
                            <time dateTime={petition.publishDate}>
                              {formatDate(petition.publishDate)}
                            </time>
                          </>
                        )}
                      </div>
                      <h3 className="font-bold text-xl leading-tight group-hover:underline decoration-2 underline-offset-4">
                        {petition.title ?? "Untitled"}
                      </h3>
                      {petition.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {petition.description}
                        </p>
                      )}
                      {/* Barra di progresso firme */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {currentSignatures.toLocaleString()} firme
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {targetSignatures.toLocaleString()} obiettivo
                          </span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-red-600 dark:bg-red-500 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {percentage}% completato
                        </span>
                      </div>
                      {authorName && (
                        <div className="flex items-center gap-2 pt-2">
                          {authorAvatarUrl && (
                            <img
                              src={authorAvatarUrl}
                              alt={authorName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">
                            di {authorName}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {pagination.pageCount > 1 && (
              <div className="flex items-center justify-center gap-4">
                {pagination.page > 1 && (
                  <Link
                    href={`/petizioni?page=${pagination.page - 1}`}
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
                    href={`/petizioni?page=${pagination.page + 1}`}
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
