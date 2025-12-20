import { getPodcastEpisodes, extractHeroImage } from "@/lib/api";
import MainLayout from "@/components/MainLayout";
import ContentCard, { formatDate, getKindAccent } from "@/components/ContentCard";
import type { Show } from "@/lib/api";
import Link from "next/link";

export default async function PodcastPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const { data: episodes, pagination } = await getPodcastEpisodes(page, 12);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="page-title text-4xl font-semibold">Podcast</h1>
          <p className="body-text mt-2">
            {episodes.length > 0 && episodes[0]?.show?.data?.attributes?.title
              ? `Tutti gli episodi podcast di ${episodes[0].show.data.attributes.title}`
              : "Tutti gli episodi podcast"}
          </p>
        </div>

        {episodes.length === 0 ? (
          <div className="content-box p-12 text-center">
            <p className="body-text">Nessun podcast disponibile al momento.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {episodes.map((episode) => {
                const showData = episode.show?.data;
                const showKind = 
                  (showData?.attributes?.kind as Show["kind"]) ?? "podcast";
                const accent = getKindAccent(showKind);

                const { url, alt } = extractHeroImage(episode.heroImage);

                return (
                  <ContentCard
                    key={episode.slug}
                    entry={{
                      title: episode.title ?? "Untitled",
                      date: formatDate(episode.publishDate),
                      summary: episode.summary ?? episode.synopsis ?? "",
                      tag: "Podcast",
                      accent,
                      imageUrl: url ?? undefined,
                      imageAlt: alt ?? episode.title,
                      locked: episode.isPremium ?? false,
                      slug: episode.slug,
                      type: "podcast",
                      borderColor: "teal-500",
                    }}
                  />
                );
              })}
            </div>

            {pagination.pageCount > 1 && (
              <div className="flex items-center justify-center gap-4">
                {pagination.page > 1 && (
                  <Link
                    href={`/podcast?page=${pagination.page - 1}`}
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
                    href={`/podcast?page=${pagination.page + 1}`}
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

