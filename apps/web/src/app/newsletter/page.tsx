import { getNewsletterIssues, extractHeroImage } from "@/lib/api";
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

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="page-title text-4xl font-semibold">Newsletter</h1>
          <p className="body-text mt-2">
            Tutte le edizioni della newsletter premium
          </p>
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
              <div className="flex items-center justify-center gap-4">
                {pagination.page > 1 && (
                  <Link
                    href={`/newsletter?page=${pagination.page - 1}`}
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
      </div>
    </MainLayout>
  );
}

