import { notFound } from "next/navigation";
import { getCourseBySlug, extractHeroImage } from "@/lib/api";
import { getSeedCourseBySlug } from "@/lib/courses-seed";
import { markdownToHtml } from "@/lib/markdown";
import MainLayout from "@/components/MainLayout";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Lock,
  PlayCircle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course =
    (await getCourseBySlug(slug)) ?? getSeedCourseBySlug(slug);

  if (!course) {
    return { title: "Corso non trovato" };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";

  return {
    metadataBase: new URL(siteUrl),
    title: `${course.title} | Corsi`,
    description:
      course.description ?? "Scopri questo corso formativo su Capibara.",
    openGraph: {
      type: "website",
      locale: "it_IT",
      url: `${siteUrl}/corsi/${slug}`,
      siteName: "Capibara",
      title: `${course.title} | Corsi Capibara`,
      description:
        course.description ?? "Scopri questo corso formativo su Capibara.",
      images: [
        {
          url: `${siteUrl}/logo_capibara.png`,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
  };
}

const levelLabels: Record<string, string> = {
  base: "Base",
  intermedio: "Intermedio",
  avanzato: "Avanzato",
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course =
    (await getCourseBySlug(slug)) ?? getSeedCourseBySlug(slug);

  if (!course) notFound();

  const bodyHtml = course.body ? markdownToHtml(course.body) : null;

  const lessons = (course.lessons?.data ?? [])
    .map((l) => l.attributes ?? l)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) as Array<{
    title: string;
    slug: string;
    order: number;
    durationMinutes?: number | null;
    isFree?: boolean;
    quiz?: unknown[] | null;
  }>;

  const totalMinutes = lessons.reduce(
    (sum, l) => sum + (l.durationMinutes ?? 0),
    0,
  );
  const totalQuizzes = lessons.filter(
    (l) => l.quiz && l.quiz.length > 0,
  ).length;

  const { url: imgUrl } = extractHeroImage(course.heroImage);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Back link */}
        <Link href="/corsi" className="back-link">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Tutti i corsi
        </Link>

        {/* Hero */}
        <div className="content-box overflow-hidden p-0">
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-gradient-to-br from-amber-600/30 via-orange-500/20 to-red-700/30">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <GraduationCap className="h-24 w-24 text-amber-500/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-2">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span
                    className="course-level-badge"
                    data-level={course.level}
                  >
                    {levelLabels[course.level] ?? course.level}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                    {course.category}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg sm:text-3xl md:text-4xl">
                  {course.title}
                </h1>
              </div>

              {course.isPremium ? (
                <div className="flex items-center gap-1 rounded-full bg-amber-500/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-black">
                  <Lock className="h-3.5 w-3.5" />
                  Premium
                </div>
              ) : (
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  Corso gratuito
                </div>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Stats */}
            <div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {lessons.length}{" "}
                {lessons.length === 1 ? "lezione" : "lezioni"}
              </span>
              {totalMinutes > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {totalMinutes} min totali
                </span>
              )}
              {totalQuizzes > 0 && (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  {totalQuizzes} quiz
                </span>
              )}
              {course.estimatedHours && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />~{course.estimatedHours}h
                </span>
              )}
            </div>

            {/* Description */}
            {course.description && (
              <p className="mb-6 max-w-3xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                {course.description}
              </p>
            )}

            {/* Body (extended description) */}
            {bodyHtml && (
              <div
                className="prose prose-invert mb-8 max-w-3xl text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            )}

            {/* Lessons list */}
            <div className="space-y-3">
              <h2 className="page-heading flex items-center gap-2 text-lg font-semibold">
                <PlayCircle className="h-5 w-5 text-amber-500" />
                Programma del corso
              </h2>
              <div className="space-y-2">
                {lessons.map((lesson, idx) => {
                  const isAccessible =
                    !course.isPremium || lesson.isFree || idx === 0;

                  return (
                    <Link
                      key={lesson.slug}
                      href={
                        isAccessible
                          ? `/corsi/${course.slug}/${lesson.slug}`
                          : "#"
                      }
                      className={
                        isAccessible ? "lesson-item" : "lesson-item opacity-60"
                      }
                      aria-disabled={!isAccessible}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-500">
                        {lesson.order}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {lesson.title}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          {lesson.durationMinutes && (
                            <span>{lesson.durationMinutes} min</span>
                          )}
                          {lesson.quiz &&
                            (lesson.quiz as unknown[]).length > 0 && (
                              <span className="flex items-center gap-0.5">
                                <CheckCircle2 className="h-3 w-3" />
                                Quiz
                              </span>
                            )}
                        </span>
                      </div>
                      {!isAccessible && (
                        <Lock className="h-4 w-4 shrink-0 text-zinc-400" />
                      )}
                      {isAccessible && lesson.isFree && course.isPremium && (
                        <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                          Gratis
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            {course.tags?.data && course.tags.data.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {course.tags.data.map((tag) => (
                  <span
                    key={tag.attributes?.slug ?? (tag as any).slug}
                    className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {tag.attributes?.name ?? (tag as any).name}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            {lessons.length > 0 && (
              <div className="mt-8">
                <Link
                  href={`/corsi/${course.slug}/${lessons[0].slug}`}
                  className="hero-button-primary inline-flex items-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Inizia il corso
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
