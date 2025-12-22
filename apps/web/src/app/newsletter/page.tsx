import { getNewsletterIssues, extractHeroImage, getDailyLinks, getColumns, type Author } from "@/lib/api";
import MainLayout from "@/components/MainLayout";
import ContentCard, { formatDate, getKindAccent } from "@/components/ContentCard";
import type { Show } from "@/lib/api";
import Link from "next/link";
import { Instagram, Music2, Linkedin, Globe } from "lucide-react";
import ShareButton from "@/components/ShareButton";

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; column?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const selectedColumnSlug = params.column;
  const { data: issues, pagination } = await getNewsletterIssues(page, 12);
  const dailyLinks = await getDailyLinks();
  const columns = await getColumns();

  const selectedColumn = selectedColumnSlug 
    ? columns.find(c => c.slug === selectedColumnSlug)
    : null;

  const selectedAuthorData = selectedColumn?.author as any;
  const selectedAuthor: Author | undefined =
    selectedAuthorData?.data?.attributes ||
    selectedAuthorData?.attributes ||
    selectedAuthorData;

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-12 items-start relative w-full">
        {/* COLONNA PRINCIPALE (SINISTRA/CENTRO) */}
        <div className="flex-1 min-w-0 space-y-12">
          {selectedColumn ? (
            /* Layout Focus Rubrica */
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Link 
                href="/newsletter"
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
                      Rubrica curata da <span className="font-semibold newsletter-author-name">{selectedAuthor?.name || "Redazione"}</span>
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
                    url={`/newsletter?column=${selectedColumn.slug}`}
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
                    <p className="text-xl newsletter-description-text italic leading-relaxed font-serif">
                      &ldquo;{selectedColumn.description}&rdquo;
                    </p>
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  {selectedColumn.links
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
                    <div className="w-2 h-8 bg-zinc-900" />
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
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-lg hover:underline decoration-2 underline-offset-4 line-clamp-2">
                              {link.title}
                            </a>
                            {link.description && <p className="text-sm newsletter-card-description mt-2 leading-relaxed line-clamp-3">{link.description}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-zinc-900" />
                    <h2 className="text-2xl font-bold uppercase tracking-tight">Dalle Rubriche</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {columns
                      .flatMap(column => column.links.map(link => ({ ...link, column, author: column.author })))
                      .filter(link => !link.publishDate || new Date(link.publishDate) <= new Date())
                      .sort(() => Math.random() - 0.5)
                      .slice(0, 4)
                      .map((item, i) => {
                        const authorData = item.author as any;
                        const author = authorData?.data?.attributes || authorData?.attributes || authorData;

                        return (
                          <div key={i} className="content-box overflow-hidden border-l-4 border-zinc-200 hover:border-zinc-900 transition-colors flex flex-col">
                            <div className="p-5 flex-1 min-w-0">
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-lg hover:underline decoration-2 underline-offset-4 line-clamp-2">
                                {item.label}
                              </a>
                              {item.description && <p className="text-sm newsletter-card-description mt-2 leading-relaxed line-clamp-3">{item.description}</p>}
                              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                  {author?.avatar && (
                                    <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-100 overflow-hidden flex items-center justify-center shrink-0">
                                      <img
                                        src={extractHeroImage(author.avatar).url ?? ""}
                                        alt={author.name}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-300">
                                      Da <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.column.title}</span>
                                    </p>
                                    {author?.name && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                                        {author.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}

              {/* Archivio Premium - mostra solo se ci sono elementi */}
              {issues.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-zinc-900" />
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
                          href={`/newsletter?page=${pagination.page - 1}`}
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
                          href={`/newsletter?page=${pagination.page + 1}`}
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
              /* Se rubrica selezionata, mostra l'ultima News in piccolo */
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
                      href="/newsletter"
                      className="text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700 block pt-2"
                    >
                      Torna alla Newsroom <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-zinc-900" />
                <h2 className="text-xl font-bold uppercase tracking-tight">Le Rubriche</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                {columns.map((column, i) => {
                  const authorData = column.author as any;
                  const author = authorData?.data?.attributes || authorData?.attributes || authorData;
                  const isSelected = selectedColumnSlug === column.slug;

                  return (
                    <Link 
                      key={i} 
                      href={`/newsletter?column=${column.slug}`}
                      className={`content-box p-4 space-y-3 transition-all ${
                        isSelected 
                          ? "border-zinc-900 bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-900" 
                          : "border-zinc-100 hover:border-zinc-900 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {author?.avatar && (
                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-100 overflow-hidden flex items-center justify-center shrink-0">
                            <img 
                              src={extractHeroImage(author.avatar).url ?? ""} 
                              alt={author?.name || "Autore"} 
                              className="w-full h-full object-contain translate-y-1.5 scale-110"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm leading-tight truncate">{column.title}</h3>
                          <div className="mt-0.5">
                            {author?.name ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                                {author.name}
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate">
                                Redazione
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!isSelected && column.description && (
                        <p className="text-[11px] newsletter-card-description italic leading-relaxed line-clamp-2">
                          &ldquo;{column.description}&rdquo;
                        </p>
                      )}

                      {isSelected && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold newsletter-featured-text flex items-center gap-1 uppercase tracking-wider">
                             In primo piano <span className="text-xs">✨</span>
                          </span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
