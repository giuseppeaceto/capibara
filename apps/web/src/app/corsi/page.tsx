import { getCourses, extractHeroImage } from "@/lib/api";
import { getSeedCourses } from "@/lib/courses-seed";
import MainLayout from "@/components/MainLayout";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Clock, GraduationCap, Sparkles, Lock } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";

  return {
    metadataBase: new URL(siteUrl),
    title: "Corsi",
    description:
      "Corsi gratuiti e premium di Capibara: giornalismo, politica, filosofia, diritti. Impara con lezioni interattive e quiz.",
    openGraph: {
      type: "website",
      locale: "it_IT",
      url: `${siteUrl}/corsi`,
      siteName: "Capibara",
      title: "Corsi | Capibara",
      description:
        "Corsi gratuiti e premium di Capibara: giornalismo, politica, filosofia, diritti.",
      images: [
        {
          url: `${siteUrl}/logo_capibara.png`,
          width: 1200,
          height: 630,
          alt: "Corsi Capibara",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Corsi | Capibara",
      description:
        "Corsi gratuiti e premium: giornalismo, politica, filosofia, diritti.",
      images: [`${siteUrl}/logo_capibara.png`],
    },
  };
}

const levelLabels: Record<string, string> = {
  base: "Base",
  intermedio: "Intermedio",
  avanzato: "Avanzato",
};

export default async function CorsiPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const { data: strapiCourses, pagination } = await getCourses(page, 12);

  const seedCourses = getSeedCourses();
  const courses =
    strapiCourses.length > 0
      ? strapiCourses
      : page === 1
        ? seedCourses
        : [];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
              <GraduationCap className="h-5 w-5 text-amber-500" />
            </div>
            <h1 className="page-title text-4xl font-semibold">Corsi</h1>
          </div>
          <p className="body-text mt-2 max-w-2xl">
            Percorsi formativi gratuiti e premium per approfondire giornalismo,
            politica, filosofia, diritti e molto altro. Ogni corso include
            lezioni interattive e quiz.
          </p>
        </div>

        {/* Courses grid */}
        {courses.length === 0 ? (
          <div className="content-box p-12 text-center">
            <GraduationCap className="mx-auto mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <p className="body-text text-lg">
              Nessun corso disponibile al momento.
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Torna a trovarci per scoprire i prossimi percorsi formativi.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const { url: imgUrl, alt: imgAlt } = extractHeroImage(
                  course.heroImage,
                );
                const lessonsCount =
                  course.lessons?.data?.length ?? 0;

                return (
                  <Link
                    key={course.slug}
                    href={`/corsi/${course.slug}`}
                    className="content-box group block overflow-hidden p-0 transition-all duration-200 hover:border-zinc-900 dark:hover:border-zinc-100"
                  >
                    {/* Image / gradient header */}
                    <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-amber-600/30 via-orange-500/20 to-red-700/30">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={imgAlt ?? course.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BookOpen className="h-16 w-16 text-amber-500/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Premium badge */}
                      {course.isPremium ? (
                        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                          <Lock className="h-3 w-3" />
                          Premium
                        </div>
                      ) : (
                        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          <Sparkles className="h-3 w-3" />
                          Gratis
                        </div>
                      )}

                      {/* Featured badge */}
                      {course.isFeatured && (
                        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                          In evidenza
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 p-5">
                      {/* Level + category */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="course-level-badge"
                          data-level={course.level}
                        >
                          {levelLabels[course.level] ?? course.level}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          {course.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold leading-tight decoration-2 underline-offset-4 group-hover:underline">
                        {course.title}
                      </h3>

                      {/* Description */}
                      {course.description && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {course.description}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                        {lessonsCount > 0 && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {lessonsCount}{" "}
                            {lessonsCount === 1 ? "lezione" : "lezioni"}
                          </span>
                        )}
                        {course.estimatedHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {course.estimatedHours}h circa
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {course.tags?.data && course.tags.data.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {course.tags.data.slice(0, 3).map((tag) => (
                            <span
                              key={
                                tag.attributes?.slug ?? (tag as any).slug
                              }
                              className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            >
                              {tag.attributes?.name ?? (tag as any).name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pageCount > 1 && (
              <div className="flex items-center justify-center gap-4">
                {pagination.page > 1 && (
                  <Link
                    href={`/corsi?page=${pagination.page - 1}`}
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
                    href={`/corsi?page=${pagination.page + 1}`}
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
