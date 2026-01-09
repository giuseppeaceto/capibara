import { getNewsletterIssues, extractHeroImage, getDailyLinks, getColumns, extractExternalMetadata, type Author } from "@/lib/api";
import MainLayout from "@/components/MainLayout";
import ContentCard, { formatDate, getKindAccent } from "@/components/ContentCard";
import type { Show } from "@/lib/api";
import Link from "next/link";
import { Instagram, Music2, Linkedin, Globe, ExternalLink } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import RubricheFilters from "@/components/RubricheFilters";
import RubricaCard, { extractAuthorData } from "@/components/RubricaCard";
import RubricheView from "@/components/RubricheView";
import CategorizedRubricheView from "@/components/CategorizedRubricheView";
import RubricheSidebar from "@/components/RubricheSidebar";

// Helper function to categorize and sort rubrica links by publication date
function getCategorizedRubricaLinks(columns: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  // Get all published links with their metadata
  const allLinks = columns
    .flatMap(column => (column.links || []).map((link: any) => ({
      ...link,
      column,
      author: column.author,
      publishDate: link.publishDate ? new Date(link.publishDate) : null
    })))
    .filter((link: any) => !link.publishDate || link.publishDate <= now)
    .sort((a, b) => {
      // Sort by publish date (newest first), null dates go to the end
      if (!a.publishDate && !b.publishDate) return 0;
      if (!a.publishDate) return 1;
      if (!b.publishDate) return -1;
      return b.publishDate.getTime() - a.publishDate.getTime();
    });

  // Categorize links by specific days
  const categories = {
    today: [] as any[],
    yesterday: [] as any[],
    twoDaysAgo: [] as any[],
    threeDaysAgo: [] as any[],
    older: [] as any[]
  };

  allLinks.forEach(link => {
    if (!link.publishDate) {
      categories.older.push(link);
    } else if (link.publishDate >= today) {
      categories.today.push(link);
    } else if (link.publishDate >= yesterday) {
      categories.yesterday.push(link);
    } else if (link.publishDate >= twoDaysAgo) {
      categories.twoDaysAgo.push(link);
    } else if (link.publishDate >= threeDaysAgo) {
      categories.threeDaysAgo.push(link);
    } else {
      categories.older.push(link);
    }
  });

  // Limit items per category for display (show all for recent days, limit older content)
  return {
    today: categories.today,
    yesterday: categories.yesterday,
    twoDaysAgo: categories.twoDaysAgo,
    threeDaysAgo: categories.threeDaysAgo,
    older: categories.older.slice(0, 3)
  };
}

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; column?: string; rubriche?: string; rubrichePage?: string; filterColumn?: string; filterAuthor?: string; filterDate?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const selectedColumnSlug = params.column;
  const showAllRubriche = params.rubriche === "all";
  const rubrichePage = parseInt(params.rubrichePage || "1", 10);
  const filterColumn = params.filterColumn;
  const filterAuthor = params.filterAuthor;
  const filterDate = params.filterDate;
  const searchQuery = params.search;
  const { data: issues, pagination } = await getNewsletterIssues(page, 12);
  const dailyLinks = await getDailyLinks() || [];
  const columns = await getColumns() || [];

  // Debug in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Newsletter page data:', {
      issuesCount: issues?.length || 0,
      dailyLinksCount: dailyLinks?.length || 0,
      columnsCount: columns?.length || 0,
      columnsWithLinks: columns?.filter(c => c.links && c.links.length > 0).length || 0,
    });
  }

  const selectedColumn = selectedColumnSlug 
    ? columns.find(c => c.slug === selectedColumnSlug)
    : null;

  const selectedAuthor = extractAuthorData(selectedColumn?.author);

  // Extract external metadata for rubric links
  let rubricLinksWithMetadata: any[] = [];
  let categorizedLinksWithMetadata: any = {
    today: [],
    yesterday: [],
    twoDaysAgo: [],
    threeDaysAgo: [],
    older: []
  };
  let filteredRubricLinksCount = 0;

  if (showAllRubriche) {
    // Logic for "all" view (vedi tutti)
    let allRubricLinks = columns
      .flatMap(column => (column.links || []).map((link: any) => ({
        ...link,
        column,
        author: column.author,
        publishDate: link.publishDate ? new Date(link.publishDate) : null
      })))
      .filter((link: any) => !link.publishDate || link.publishDate <= new Date());

    // Apply filters
    if (filterColumn) {
      allRubricLinks = allRubricLinks.filter((link: any) => link.column.slug === filterColumn);
    }

    if (filterAuthor) {
      allRubricLinks = allRubricLinks.filter((link: any) => {
        const author = extractAuthorData(link.author);
        return author?.name === filterAuthor;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      allRubricLinks = allRubricLinks.filter((link: any) => {
        const title = link.label?.toLowerCase() || "";
        const description = link.description?.toLowerCase() || "";
        const authorName = extractAuthorData(link.author)?.name?.toLowerCase() || "";
        const columnTitle = link.column?.title?.toLowerCase() || "";
        return title.includes(query) || description.includes(query) || authorName.includes(query) || columnTitle.includes(query);
      });
    }

    if (filterDate && filterDate !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      let cutoffDate: Date;

      switch (filterDate) {
        case "today":
          cutoffDate = today;
          break;
        case "7days":
          cutoffDate = new Date(today);
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          break;
        case "30days":
          cutoffDate = new Date(today);
          cutoffDate.setDate(cutoffDate.getDate() - 30);
          break;
        case "90days":
          cutoffDate = new Date(today);
          cutoffDate.setDate(cutoffDate.getDate() - 90);
          break;
        case "6months":
          cutoffDate = new Date(today);
          cutoffDate.setMonth(cutoffDate.getMonth() - 6);
          break;
        default:
          cutoffDate = new Date(0); // No filter
      }

      if (filterDate === "today") {
        // For "today", filter: publishDate >= today and < tomorrow
        allRubricLinks = allRubricLinks.filter((link: any) => {
          if (!link.publishDate) return false;
          return link.publishDate >= cutoffDate && link.publishDate < tomorrow;
        });
      } else if (cutoffDate.getTime() > 0) {
        // For other periods, filter: publishDate >= cutoffDate
        allRubricLinks = allRubricLinks.filter((link: any) => {
          if (!link.publishDate) return false;
          return link.publishDate >= cutoffDate;
        });
      }
    }

    filteredRubricLinksCount = allRubricLinks.length;

    // Sort after filtering
    allRubricLinks.sort((a, b) => {
      if (!a.publishDate && !b.publishDate) return 0;
      if (!a.publishDate) return 1;
      if (!b.publishDate) return -1;
      return b.publishDate.getTime() - a.publishDate.getTime();
    });

    // Get current page links for metadata extraction
    const itemsPerPage = 10;
    const startIndex = (rubrichePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageLinks = allRubricLinks.slice(startIndex, endIndex);

    // Extract metadata for current page (limit concurrency to avoid overwhelming servers)
    rubricLinksWithMetadata = await Promise.all(
      currentPageLinks.map(async (item) => {
        try {
          const metadata = await extractExternalMetadata(item.url);
          return { ...item, externalMetadata: metadata };
        } catch (error) {
          return { ...item, externalMetadata: {} };
        }
      })
    );
  } else {
    // Logic for categorized view ("Dalle Rubriche")
    const categorized = getCategorizedRubricaLinks(columns);

    // Extract metadata for all links that will be displayed in the categorized view
    const allDisplayedLinks = [
      ...categorized.today,
      ...categorized.yesterday,
      ...categorized.twoDaysAgo,
      ...categorized.threeDaysAgo,
      ...categorized.older,
    ];

    // Extract metadata for all displayed links
    const linksWithMetadata = await Promise.all(
      allDisplayedLinks.map(async (item) => {
        try {
          const metadata = await extractExternalMetadata(item.url);
          return { ...item, externalMetadata: metadata };
        } catch (error) {
          return { ...item, externalMetadata: {} };
        }
      })
    );

    // Rebuild categorized structure with metadata
    const metadataMap = new Map(linksWithMetadata.map(link => [link.url, link.externalMetadata]));

    categorizedLinksWithMetadata = {
      today: categorized.today.map(link => ({ ...link, externalMetadata: metadataMap.get(link.url) || {} })),
      yesterday: categorized.yesterday.map(link => ({ ...link, externalMetadata: metadataMap.get(link.url) || {} })),
      twoDaysAgo: categorized.twoDaysAgo.map(link => ({ ...link, externalMetadata: metadataMap.get(link.url) || {} })),
      threeDaysAgo: categorized.threeDaysAgo.map(link => ({ ...link, externalMetadata: metadataMap.get(link.url) || {} })),
      older: categorized.older.map(link => ({ ...link, externalMetadata: metadataMap.get(link.url) || {} }))
    };
  }

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-12 items-start relative w-full">
        {/* COLONNA PRINCIPALE (SINISTRA/CENTRO) */}
        <div className="flex-1 min-w-0 space-y-12">
          {selectedColumn ? (
            /* Layout Focus Rubrica */
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Link 
                href="/newsroom"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                Torna alla Newsroom
              </Link>

              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  {selectedAuthor?.avatar && (
                    <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-2 ring-zinc-100 overflow-hidden flex items-center justify-center shrink-0">
                      <img 
                        src={extractHeroImage(selectedAuthor.avatar).url ?? ""} 
                        alt={selectedAuthor.name} 
                        className="w-full h-full object-contain translate-y-2 scale-110"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">{selectedColumn.title}</h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2">
                      Rubrica curata da <span className="font-semibold newsroom-author-name">{selectedAuthor?.name || "Redazione"}</span>
                    </p>
                    {(selectedAuthor?.instagram ||
                      selectedAuthor?.tiktok ||
                      selectedAuthor?.linkedin ||
                      selectedAuthor?.website) && (
                      <div className="flex items-center gap-3 mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                        {selectedAuthor.instagram && (
                          <a
                            href={selectedAuthor.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            aria-label="Instagram"
                          >
                            <Instagram className="h-4 w-4" />
                          </a>
                        )}
                        {selectedAuthor.tiktok && (
                          <a
                            href={selectedAuthor.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            aria-label="TikTok"
                          >
                            <Music2 className="h-4 w-4" />
                          </a>
                        )}
                        {selectedAuthor.linkedin && (
                          <a
                            href={selectedAuthor.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {selectedAuthor.website && (
                          <a
                            href={selectedAuthor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            aria-label="Sito personale"
                          >
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pulsante di condivisione */}
                <div className="flex justify-end">
                  <ShareButton
                    title={selectedColumn.title}
                    url={`/newsroom?column=${selectedColumn.slug}`}
                    text={`Scopri la rubrica "${selectedColumn.title}" su Capibara`}
                  />
                </div>

                {selectedColumn.cover && (
                  <div className="aspect-[21/9] w-full overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-800">
                    <img 
                      src={extractHeroImage(selectedColumn.cover).url ?? ""} 
                      alt={selectedColumn.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {selectedColumn.description && (
                  <div className="content-box p-8">
                    <p className="text-xl newsroom-description-text italic leading-relaxed font-serif">
                      &ldquo;{selectedColumn.description}&rdquo;
                    </p>
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  {(selectedColumn.links || [])
                    .filter(link => !link.publishDate || new Date(link.publishDate) <= new Date())
                    .map((link, j) => (
                    <div key={j} className="content-box p-6 space-y-4 hover:border-zinc-900 transition-colors group h-full flex flex-col">
                      <div className="flex-1 space-y-2">
                        <h3 className="font-bold text-xl leading-tight group-hover:underline decoration-2 underline-offset-4">
                          {link.label}
                        </h3>
                        {link.description && (
                          <p className="text-sm text-zinc-900 dark:text-zinc-400 leading-relaxed">
                            {link.description}
                          </p>
                        )}
                      </div>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-sm font-bold mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 hover:text-zinc-600"
                      >
                        Leggi approfondimento <span>→</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            /* Layout Standard News */
            <>
              {/* Header */}
              <div>
                <h1 className="page-title text-4xl font-semibold">Newsroom</h1>
                <p className="body-text mt-2">
                  Link curati, approfondimenti giornalieri e le nostre edizioni premium.
                </p>
              </div>

              {/* Link del Giorno o Dalle Rubriche */}
              {dailyLinks.length > 0 ? (
                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-zinc-900 dark:bg-zinc-100" />
                    <h2 className="text-2xl font-bold uppercase tracking-tight">Link del Giorno</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {dailyLinks.map((link, i) => {
                      const { url: imageUrl, alt: imageAlt } = extractHeroImage(link.image);

                      return (
                        <div key={i} className="content-box overflow-hidden border-l-4 border-zinc-200 hover:border-zinc-900 transition-colors flex flex-col sm:flex-row">
                          {imageUrl && (
                            <div className="w-full sm:w-32 h-32 shrink-0">
                              <img
                                src={imageUrl}
                                alt={imageAlt || link.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-5 flex-1 min-w-0">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-lg hover:underline decoration-2 underline-offset-4 line-clamp-2 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                              {link.title}
                            </a>
                            {link.description && <p className="text-sm newsroom-card-description mt-2 leading-relaxed line-clamp-3">{link.description}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : showAllRubriche ? (
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 bg-zinc-900 dark:bg-zinc-100" />
                      <h2 className="text-2xl font-bold uppercase tracking-tight">Tutte le Rubriche</h2>
                    </div>
                    <Link
                      href="/newsroom"
                      className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                    >
                      ← Torna indietro
                    </Link>
                  </div>

                  {(() => {
                    // Extract all links with filters applied (same logic as above)
                    let allLinks = columns
                      .flatMap(column => (column.links || []).map((link: any) => ({
                        ...link,
                        column,
                        author: column.author,
                        publishDate: link.publishDate ? new Date(link.publishDate) : null
                      })))
                      .filter((link: any) => !link.publishDate || link.publishDate <= new Date());

                    if (filterColumn) {
                      allLinks = allLinks.filter((link: any) => link.column.slug === filterColumn);
                    }
                    
                    if (filterAuthor) {
                      allLinks = allLinks.filter((link: any) => {
                        const author = extractAuthorData(link.author);
                        return author?.name === filterAuthor;
                      });
                    }

                    // Extract unique authors for filter component
                    const allAuthors = columns
                      .map(column => extractAuthorData(column.author))
                      .filter((author): author is Author => author !== undefined);

                    // Pagination logic for rubrics (using filteredRubricLinksCount from above)
                    const itemsPerPage = 10;
                    const totalPages = Math.ceil(filteredRubricLinksCount / itemsPerPage);
                    
                    if (filteredRubricLinksCount === 0) {
                      return (
                        <>
                          <RubricheFilters
                            columns={columns.map(c => ({ title: c.title, slug: c.slug }))}
                            authors={allAuthors.map(a => ({ name: a.name, avatar: a.avatar }))}
                            selectedColumn={filterColumn}
                            selectedAuthor={filterAuthor}
                            selectedDate={filterDate}
                            searchQuery={searchQuery}
                          />
                          <div className="content-box p-8 text-center">
                            <p className="text-zinc-600 dark:text-zinc-400">
                              Nessun contenuto disponibile dalle rubriche al momento.
                            </p>
                          </div>
                        </>
                      );
                    }

                    // Build pagination URL with filters
                    const buildPaginationUrl = (pageNum: number) => {
                      const params = new URLSearchParams({ rubriche: "all", rubrichePage: pageNum.toString() });
                      if (filterColumn) params.set("filterColumn", filterColumn);
                      if (filterAuthor) params.set("filterAuthor", filterAuthor);
                      if (filterDate) params.set("filterDate", filterDate);
                      return `/newsroom?${params.toString()}`;
                    };

                    return (
                      <>
                          <RubricheFilters
                            columns={columns.map(c => ({ title: c.title, slug: c.slug }))}
                            authors={allAuthors.map(a => ({ name: a.name, avatar: a.avatar }))}
                            selectedColumn={filterColumn}
                            selectedAuthor={filterAuthor}
                            selectedDate={filterDate}
                            searchQuery={searchQuery}
                          />
                        
                        {filteredRubricLinksCount > 0 && (
                          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                            {filteredRubricLinksCount} {filteredRubricLinksCount === 1 ? 'contenuto trovato' : 'contenuti trovati'}
                          </div>
                        )}
                        
                        <RubricheView items={rubricLinksWithMetadata} compact={true} />

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-4 pt-8">
                            {rubrichePage > 1 && (
                              <Link
                                href={buildPaginationUrl(rubrichePage - 1)}
                                className="pagination-button"
                              >
                                ← Precedente
                              </Link>
                            )}
                            <span className="text-sm font-medium text-zinc-500">
                              Pagina {rubrichePage} di {totalPages}
                            </span>
                            {rubrichePage < totalPages && (
                              <Link
                                href={buildPaginationUrl(rubrichePage + 1)}
                                className="pagination-button"
                              >
                                Successiva →
                              </Link>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </section>
              ) : (
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 bg-zinc-900 dark:bg-zinc-100" />
                      <h2 className="text-2xl font-bold uppercase tracking-tight">Dalle Rubriche</h2>
                    </div>
                    <Link
                      href="/newsroom?rubriche=all"
                      className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                    >
                      Vedi tutti →
                    </Link>
                  </div>

                  {(() => {
                    const categorizedLinks = categorizedLinksWithMetadata;
                    const hasContent = categorizedLinks.today.length > 0 ||
                                     categorizedLinks.yesterday.length > 0 ||
                                     categorizedLinks.twoDaysAgo.length > 0 ||
                                     categorizedLinks.threeDaysAgo.length > 0 ||
                                     categorizedLinks.older.length > 0;

                    if (!hasContent) {
                      return (
                        <div className="content-box p-8 text-center">
                          <p className="text-zinc-600 dark:text-zinc-400">
                            Nessun contenuto disponibile dalle rubriche al momento.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <CategorizedRubricheView categorizedLinks={categorizedLinks} />
                    );
                  })()}
                </section>
              )}

              {/* Archivio Premium - mostra solo se ci sono elementi */}
              {issues.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-zinc-900 dark:bg-zinc-100" />
                    <h2 className="text-2xl font-bold uppercase tracking-tight">Archivio Premium</h2>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {issues.map((issue) => {
                      const showData = issue.show?.data;
                      const showKind =
                        (showData?.attributes?.kind as Show["kind"]) ?? "newsroom";
                      const accent = getKindAccent(showKind);

                      const { url, alt } = extractHeroImage(issue.heroImage);

                      return (
                        <ContentCard
                          key={issue.slug}
                          entry={{
                            title: issue.title ?? "Untitled",
                            date: formatDate(issue.publishDate),
                            summary: issue.excerpt ?? issue.summary ?? "",
                            tag: "Newsroom",
                            accent,
                            imageUrl: url ?? undefined,
                            imageAlt: alt ?? issue.title,
                            locked: issue.isPremium ?? true,
                            slug: issue.slug,
                            type: "newsroom",
                          }}
                        />
                      );
                    })}
                  </div>

                  {pagination.pageCount > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                      {pagination.page > 1 && (
                        <Link
                          href={`/newsroom?page=${pagination.page - 1}`}
                          className="pagination-button"
                        >
                          ← Precedente
                        </Link>
                      )}
                      <span className="text-sm font-medium text-zinc-500">
                        Pagina {pagination.page} di {pagination.pageCount}
                      </span>
                      {pagination.page < pagination.pageCount && (
                        <Link
                          href={`/newsroom?page=${pagination.page + 1}`}
                          className="pagination-button"
                        >
                          Successiva →
                        </Link>
                      )}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>

        {/* COLONNA DESTRA (SIDEBAR) */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-8">
          <div className="space-y-8">
            {selectedColumn && issues.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-amber-500" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Ultima News</h2>
                </div>
                <div className="content-box overflow-hidden group">
                  {issues[0].heroImage && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={extractHeroImage(issues[0].heroImage).url ?? ""}
                        alt={issues[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm leading-tight line-clamp-2">{issues[0].title}</h3>
                    <Link
                      href="/newsroom"
                      className="text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700 block pt-2"
                    >
                      Torna alla Newsroom <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <RubricheSidebar columns={columns} selectedColumnSlug={selectedColumnSlug} />
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
