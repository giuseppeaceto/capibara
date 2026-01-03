/* ArchivioContent: componente client che gestisce ricerca e vista hub iniziale */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate } from "@/components/ContentCard";
import ContentListItem from "@/components/ContentListItem";
import type {
  VideoEpisode,
  PodcastEpisode,
  NewsletterIssue,
  Article,
  Column,
} from "@/lib/api";
import { Search } from "lucide-react";

type SearchResults = {
  videos: VideoEpisode[];
  podcasts: PodcastEpisode[];
  newsletters: NewsletterIssue[];
  articles: Article[];
  columns: Column[];
  rubricaLinks?: RubricaLink[];
} | null;

type RubricaLink = {
  id: string;
  label: string;
  description?: string;
  url: string;
  publishDate: Date | null;
  column: Column;
  author: any;
};

type ArchivioContentProps = {
  initialVideos: VideoEpisode[];
  initialPodcasts: PodcastEpisode[];
  initialNewsletters: NewsletterIssue[];
  initialArticles: Article[];
  initialColumns: Column[];
  initialRubricaLinks: RubricaLink[];
};

export function ArchivioContent({
  initialVideos,
  initialPodcasts,
  initialNewsletters,
  initialArticles,
  initialColumns,
  initialRubricaLinks,
}: ArchivioContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialPage = parseInt(searchParams.get("page") || "1");
  const initialLimit = parseInt(searchParams.get("limit") || "20");

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage] = useState(initialLimit);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    } else {
      // Reset pagina quando non stiamo cercando
      setCurrentPage(initialPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, initialPage]);

  const handleSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults(null);
      setCurrentPage(1);
      router.push("/archivio");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(trimmed)}`,
      );
      const data = await response.json();
      setResults(data);
      setCurrentPage(1); // Reset pagina quando si fa una nuova ricerca
      router.push(`/archivio?q=${encodeURIComponent(trimmed)}`);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPaginatedItems = (items: UnifiedItem[], page: number, limit: number) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return items.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/archivio?${params.toString()}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const hasSearchResults =
    !!results &&
    (results.videos?.length > 0 ||
      results.podcasts?.length > 0 ||
      results.newsletters?.length > 0 ||
      results.articles?.length > 0 ||
      results.columns?.length > 0 ||
      (results.rubricaLinks && results.rubricaLinks.length > 0));

  const showInitialHub = !results && !loading && !query.trim();

  type UnifiedItem = {
    id: string;
    title: string;
    isoDate: string | null | undefined;
    date: string;
    summary: string;
    tag: string;
    locked: boolean;
    slug?: string;
    type?: "video" | "podcast" | "newsroom" | "article" | "column";
  };

  const sortByDateDesc = (a: UnifiedItem, b: UnifiedItem) => {
    const da = a.isoDate ? new Date(a.isoDate).getTime() : 0;
    const db = b.isoDate ? new Date(b.isoDate).getTime() : 0;
    return db - da;
  };

  const initialUnifiedList: UnifiedItem[] = [
    ...initialVideos.map((episode) => ({
      id: `video-${episode.slug}`,
      title: episode.title ?? "Untitled",
      isoDate: episode.publishDate,
      date: formatDate(episode.publishDate),
      summary: episode.synopsis ?? episode.summary ?? "",
      tag: "Video",
      locked: episode.isPremium ?? false,
      slug: episode.slug,
      type: "video" as const,
    })),
    ...initialPodcasts.map((episode) => ({
      id: `podcast-${episode.slug}`,
      title: episode.title ?? "Untitled",
      isoDate: episode.publishDate,
      date: formatDate(episode.publishDate),
      summary: episode.summary ?? episode.synopsis ?? "",
      tag: "Podcast",
      locked: episode.isPremium ?? false,
      slug: episode.slug,
      type: "podcast" as const,
    })),
    ...initialNewsletters.map((issue) => ({
      id: `newsroom-${issue.slug}`,
      title: issue.title ?? "Untitled",
      isoDate: issue.publishDate,
      date: formatDate(issue.publishDate),
      summary: issue.excerpt ?? issue.summary ?? "",
      tag: "Newsroom",
      locked: issue.isPremium ?? true,
      slug: issue.slug,
      type: "newsroom" as const,
    })),
    ...initialArticles.map((article) => ({
      id: `article-${article.slug}`,
      title: article.title ?? "Untitled",
      isoDate: article.publishDate,
      date: formatDate(article.publishDate),
      summary: article.excerpt ?? "",
      tag: "Articolo",
      locked: article.isPremium ?? false,
      slug: article.slug,
      type: "article" as const,
    })),
    ...initialColumns.map((column) => ({
      id: `column-${column.slug}`,
      title: column.title ?? "Untitled",
      isoDate: null, // Le rubriche non hanno una data specifica
      date: "",
      summary: column.description ?? "",
      tag: "Rubrica",
      locked: false,
      slug: column.slug,
      type: "column" as const,
    })),
    ...initialRubricaLinks.map((link, index) => ({
      id: `rubrica-link-${index}-${link.url || link.label}`,
      title: link.label,
      isoDate: link.publishDate ? link.publishDate.toISOString() : null,
      date: link.publishDate ? formatDate(link.publishDate) : "",
      summary: link.description ?? "",
      tag: "Rubrica",
      locked: false,
      slug: link.url, // Usiamo l'URL come slug per i link esterni
      type: "rubrica-link" as const,
    })),
  ].sort(sortByDateDesc);

  const searchUnifiedList: UnifiedItem[] | null = results
    ? [
        ...(results.videos?.map((episode) => ({
          id: `video-${episode.slug}`,
          title: episode.title ?? "Untitled",
          isoDate: episode.publishDate,
          date: formatDate(episode.publishDate),
          summary: episode.synopsis ?? episode.summary ?? "",
          tag: "Video",
          locked: episode.isPremium ?? false,
          slug: episode.slug,
          type: "video" as const,
        })) || []),
        ...(results.podcasts?.map((episode) => ({
          id: `podcast-${episode.slug}`,
          title: episode.title ?? "Untitled",
          isoDate: episode.publishDate,
          date: formatDate(episode.publishDate),
          summary: episode.summary ?? episode.synopsis ?? "",
          tag: "Podcast",
          locked: episode.isPremium ?? false,
          slug: episode.slug,
          type: "podcast" as const,
        })) || []),
        ...(results.newsletters?.map((issue) => ({
          id: `newsroom-${issue.slug}`,
          title: issue.title ?? "Untitled",
          isoDate: issue.publishDate,
          date: formatDate(issue.publishDate),
          summary: issue.excerpt ?? issue.summary ?? "",
          tag: "Newsroom",
          locked: issue.isPremium ?? true,
          slug: issue.slug,
          type: "newsroom" as const,
        })) || []),
        ...(results.articles?.map((article) => ({
          id: `article-${article.slug}`,
          title: article.title ?? "Untitled",
          isoDate: article.publishDate,
          date: formatDate(article.publishDate),
          summary: article.excerpt ?? "",
          tag: "Articolo",
          locked: article.isPremium ?? false,
          slug: article.slug,
          type: "article" as const,
        })) || []),
        ...(results.columns?.map((column) => ({
          id: `column-${column.slug}`,
          title: column.title ?? "Untitled",
          isoDate: null, // Le rubriche non hanno una data specifica
          date: "",
          summary: column.description ?? "",
          tag: "Rubrica",
          locked: false,
          slug: column.slug,
          type: "column" as const,
        })) || []),
        ...(results.rubricaLinks?.map((link, index) => ({
          id: `search-rubrica-link-${index}-${link.url || link.label}`,
          title: link.label,
          isoDate: link.publishDate ? link.publishDate.toISOString() : null,
          date: link.publishDate ? formatDate(link.publishDate) : "",
          summary: link.description ?? "",
          tag: "Rubrica",
          locked: false,
          slug: link.url,
          type: "rubrica-link" as const,
        })) || []),
      ].sort(sortByDateDesc)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title text-4xl font-semibold">Archivio</h1>
        <p className="body-text mt-2">
          Cerca o esplora tutti i contenuti di Capibara Media
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="search-box">
          <Search className="h-5 w-5 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca episodi, podcast, newsletter o articoli..."
            className="search-input"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="search-button"
          >
            {loading ? "Cercando..." : "Cerca"}
          </button>
        </div>
      </form>

      {showInitialHub && (
        <div className="space-y-6">
          <div className="info-box">
            <p className="info-box-text">
              Inizia a digitare per cercare tra tutti i contenuti, oppure
              scorri la lista unificata qui sotto.
            </p>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="section-header">
                Tutti i contenuti recenti
              </h2>
              <span className="text-xs text-zinc-500">
                {initialUnifiedList.length} elementi totali
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {getPaginatedItems(initialUnifiedList, currentPage, itemsPerPage).map((item) => (
                <ContentListItem
                  key={item.id}
                  item={{
                    title: item.title,
                    date: item.date,
                    summary: item.summary,
                    tag: item.tag,
                    locked: item.locked,
                    slug: item.slug,
                    type: item.type,
                  }}
                />
              ))}
            </div>

            {/* Controlli paginazione */}
            {initialUnifiedList.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Precedente
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-600">
                    Pagina {currentPage} di {Math.ceil(initialUnifiedList.length / itemsPerPage)}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(initialUnifiedList.length / itemsPerPage)}
                  className="px-3 py-1 text-sm border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Successivo
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {!showInitialHub && results && (
        <div className="space-y-6">
          {!hasSearchResults || !searchUnifiedList || searchUnifiedList.length === 0 ? (
            <div className="content-box p-12 text-center">
              <p className="body-text">
                Nessun risultato trovato per &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <h2 className="section-header">
                    Risultati ricerca
                  </h2>
                  <p className="text-xs text-zinc-500">
                    per &quot;{query}&quot;
                  </p>
                </div>
                <span className="text-xs text-zinc-500">
                  {searchUnifiedList.length} elementi
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {getPaginatedItems(searchUnifiedList, currentPage, itemsPerPage).map((item) => (
                  <ContentListItem
                    key={item.id}
                    item={{
                      title: item.title,
                      date: item.date,
                      summary: item.summary,
                      tag: item.tag,
                      locked: item.locked,
                      slug: item.slug,
                      type: item.type,
                    }}
                  />
                ))}
              </div>

              {/* Controlli paginazione per risultati ricerca */}
              {searchUnifiedList.length > itemsPerPage && (
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Precedente
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-600">
                      Pagina {currentPage} di {Math.ceil(searchUnifiedList.length / itemsPerPage)}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(searchUnifiedList.length / itemsPerPage)}
                    className="px-3 py-1 text-sm border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Successivo
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default ArchivioContent;


