import { getNewsletterIssues, extractHeroImage, getDailyLinks, getColumns } from "@/lib/api";
import MainLayout from "@/components/MainLayout";
import ContentCard, { formatDate, getKindAccent } from "@/components/ContentCard";
import type { Show } from "@/lib/api";
import Link from "next/link";

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const { data: issues, pagination } = await getNewsletterIssues(page, 12);
  const dailyLinks = await getDailyLinks();
  const columns = await getColumns();

  return (
    <MainLayout>
      <div className="space-y-12">
        <div>
          <h1 className="page-title text-4xl font-semibold">Newsletter</h1>
          <p className="body-text mt-2">
            Link curati, approfondimenti giornalieri e le nostre edizioni premium.
          </p>
        </div>

        {/* Link del Giorno */}
        {dailyLinks.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-8 bg-zinc-900" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Link del Giorno</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
                    <div className="p-5 flex-1">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-lg hover:underline decoration-2 underline-offset-4 line-clamp-2">
                        {link.title}
                      </a>
                      {link.description && <p className="text-sm text-zinc-600 mt-2 leading-relaxed line-clamp-3">{link.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Rubriche Autori */}
        {columns.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-8 bg-zinc-900" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Le Rubriche</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {columns.map((column, i) => {
                // Gestisce i diversi formati di risposta di Strapi per la relazione author
                const authorData = column.author as any;
                const author = authorData?.data?.attributes || authorData?.attributes || authorData;

                return (
                  <div key={i} className="content-box p-6 space-y-5 flex flex-col">
                    <div className="flex items-center gap-4">
                      {author?.avatar && (
                        <img 
                          src={extractHeroImage(author.avatar).url ?? ""} 
                          alt={author?.name || "Autore"} 
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-100"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-xl leading-none page-heading">{column.title}</h3>
                        <p className="text-sm text-zinc-500 mt-1">curata da <span className="font-medium text-zinc-900 dark:text-zinc-100">{author?.name || "Redazione"}</span></p>
                      </div>
                    </div>
                    
                    {column.description && (
                      <p className="text-sm text-zinc-600 italic leading-relaxed">
                        &ldquo;{column.description}&rdquo;
                      </p>
                    )}

                    <div className="space-y-4 pt-2 flex-grow">
                      {column.links.map((link, j) => (
                        <div key={j} className="group">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-bold text-sm hover:text-zinc-600 flex items-center gap-1">
                            {link.label}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                          </a>
                          {link.description && <p className="text-xs text-zinc-500 mt-1 leading-normal">{link.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-zinc-900" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Archivio Premium</h2>
          </div>

          {issues.length === 0 ? (
            <div className="content-box p-12 text-center">
              <p className="body-text">Nessuna newsletter disponibile al momento.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {issues.map((issue) => {
                  const showData = issue.show?.data;
                  const showKind = 
                    (showData?.attributes?.kind as Show["kind"]) ?? "newsletter";
                  const accent = getKindAccent(showKind);

                  const { url, alt } = extractHeroImage(issue.heroImage);

                  return (
                    <ContentCard
                      key={issue.slug}
                      entry={{
                        title: issue.title ?? "Untitled",
                        date: formatDate(issue.publishDate),
                        summary: issue.excerpt ?? issue.summary ?? "",
                        tag: "Newsletter",
                        accent,
                        imageUrl: url ?? undefined,
                        imageAlt: alt ?? issue.title,
                        locked: issue.isPremium ?? true,
                        slug: issue.slug,
                        type: "newsletter",
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
            </>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

