"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import ContentCard, { formatDate, getKindAccent } from "@/components/ContentCard";
import type { Show } from "@/lib/api";
import { Search } from "lucide-react";

function ArchivioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<{
    videos: any[];
    podcasts: any[];
    newsletters: any[];
    articles: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data);
      router.push(`/archivio?q=${encodeURIComponent(searchQuery)}`);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold text-white">Archivio</h1>
        <p className="mt-2 text-zinc-400">
          Cerca tra tutti i contenuti di Capibara Media
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <Search className="h-5 w-5 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca episodi, podcast o newsletter..."
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-full bg-white/90 px-6 py-2 text-sm font-semibold text-black transition hover:bg-white disabled:opacity-50"
          >
            {loading ? "Cercando..." : "Cerca"}
          </button>
        </div>
      </form>

      {results && (
        <div className="space-y-8">
          {results.videos.length === 0 &&
          results.podcasts.length === 0 &&
          results.newsletters.length === 0 &&
          results.articles.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 p-12 text-center">
              <p className="text-zinc-400">
                Nessun risultato trovato per &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <>
              {results.videos.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Video</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.videos.map((episode) => {
                      const showData = episode.show?.data;
                      const showKind =
                        (showData?.attributes?.kind as Show["kind"]) ?? "video";
                      const accent = getKindAccent(showKind);

                      return (
                        <ContentCard
                          key={episode.slug}
                          entry={{
                            title: episode.title ?? "Untitled",
                            date: formatDate(episode.publishDate),
                            summary: episode.synopsis ?? episode.summary ?? "",
                            tag: "Video",
                            accent,
                            locked: episode.isPremium ?? false,
                            slug: episode.slug,
                            type: "video",
                          }}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {results.podcasts.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Podcast</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.podcasts.map((episode) => {
                      const showData = episode.show?.data;
                      const showKind =
                        (showData?.attributes?.kind as Show["kind"]) ?? "podcast";
                      const accent = getKindAccent(showKind);

                      return (
                        <ContentCard
                          key={episode.slug}
                          entry={{
                            title: episode.title ?? "Untitled",
                            date: formatDate(episode.publishDate),
                            summary: episode.summary ?? episode.synopsis ?? "",
                            tag: "Podcast",
                            accent,
                            locked: episode.isPremium ?? false,
                            slug: episode.slug,
                            type: "podcast",
                          }}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {results.newsletters.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Newsletter</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.newsletters.map((issue) => {
                      const showData = issue.show?.data;
                      const showKind =
                        (showData?.attributes?.kind as Show["kind"]) ?? "newsletter";
                      const accent = getKindAccent(showKind);

                      return (
                        <ContentCard
                          key={issue.slug}
                          entry={{
                            title: issue.title ?? "Untitled",
                            date: formatDate(issue.publishDate),
                            summary: issue.excerpt ?? issue.summary ?? "",
                            tag: "Newsletter",
                            accent,
                            locked: issue.isPremium ?? true,
                            slug: issue.slug,
                            type: "newsletter",
                          }}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {results.articles.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Articoli</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.articles.map((article) => (
                      <ContentCard
                        key={article.slug}
                        entry={{
                          title: article.title ?? "Untitled",
                          date: formatDate(article.publishDate),
                          summary: article.excerpt ?? "",
                          tag: "Articolo",
                          accent: "from-blue-500/30 via-indigo-500/20 to-purple-900/40",
                          locked: article.isPremium ?? false,
                          slug: article.slug,
                          type: "article",
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ArchivioPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-semibold text-white">Archivio</h1>
            <p className="mt-2 text-zinc-400">
              Cerca tra tutti i contenuti di Capibara Media
            </p>
          </div>
        </div>
      }>
        <ArchivioContent />
      </Suspense>
    </MainLayout>
  );
}

