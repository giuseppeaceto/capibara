import { notFound } from "next/navigation";
import { getCourseBySlug, getLessonBySlug } from "@/lib/api";
import { getSeedCourseBySlug, getSeedLessonBySlug } from "@/lib/courses-seed";
import { markdownToHtml } from "@/lib/markdown";
import MainLayout from "@/components/MainLayout";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
} from "lucide-react";
import LessonQuiz from "./LessonQuiz";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const course =
    (await getCourseBySlug(slug)) ?? getSeedCourseBySlug(slug);
  const lesson =
    (await getLessonBySlug(slug, lessonSlug)) ??
    getSeedLessonBySlug(slug, lessonSlug);

  if (!course || !lesson) return { title: "Lezione non trovata" };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";

  return {
    metadataBase: new URL(siteUrl),
    title: `${lesson.title} | ${course.title}`,
    description: `Lezione ${lesson.order} del corso "${course.title}" su Capibara.`,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;

  const course =
    (await getCourseBySlug(slug)) ?? getSeedCourseBySlug(slug);
  if (!course) notFound();

  const lesson =
    (await getLessonBySlug(slug, lessonSlug)) ??
    getSeedLessonBySlug(slug, lessonSlug);
  if (!lesson) notFound();

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

  const currentIndex = lessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const bodyHtml = lesson.body ? markdownToHtml(lesson.body) : null;

  const youtubeId = lesson.videoUrl
    ? extractYouTubeId(lesson.videoUrl)
    : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/corsi" className="back-link">
            Corsi
          </Link>
          <span className="text-zinc-500">/</span>
          <Link href={`/corsi/${slug}`} className="back-link">
            {course.title}
          </Link>
          <span className="text-zinc-500">/</span>
          <span className="text-zinc-400 dark:text-zinc-500">
            Lezione {lesson.order}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div className="min-w-0 space-y-8">
            {/* Lesson header */}
            <header className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-500">
                  {lesson.order}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Lezione {lesson.order} di {lessons.length}
                </span>
                {lesson.durationMinutes && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Clock className="h-3.5 w-3.5" />
                      {lesson.durationMinutes} min di lettura
                    </span>
                  </>
                )}
              </div>
              <h1 className="page-title text-2xl font-bold leading-tight sm:text-3xl">
                {lesson.title}
              </h1>
              {/* Mini progress */}
              <div className="progress-bar-bg max-w-xs">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${((currentIndex + 1) / lessons.length) * 100}%`,
                  }}
                />
              </div>
            </header>

            {/* Video embed */}
            {youtubeId && (
              <div className="content-box overflow-hidden p-0">
                <div className="relative aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            )}

            {/* Body */}
            {bodyHtml && (
              <article className="content-box px-6 py-8 sm:px-10 sm:py-10">
                <div
                  className="lesson-prose"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              </article>
            )}

            {/* Quiz */}
            {lesson.quiz && lesson.quiz.length > 0 && (
              <section className="space-y-3">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Metti alla prova quello che hai imparato in questa lezione:
                </p>
                <LessonQuiz
                  questions={lesson.quiz.map((q: any) => ({
                    id: q.id,
                    question: q.question,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    optionC: q.optionC ?? null,
                    optionD: q.optionD ?? null,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation ?? null,
                  }))}
                />
              </section>
            )}

            {/* Navigation */}
            <nav className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              {prevLesson ? (
                <Link
                  href={`/corsi/${slug}/${prevLesson.slug}`}
                  className="group flex flex-col items-start gap-0.5"
                >
                  <span className="flex items-center gap-1 text-xs text-zinc-500 transition group-hover:text-zinc-300">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Lezione precedente
                  </span>
                  <span className="text-sm font-medium page-heading transition group-hover:underline">
                    {prevLesson.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {nextLesson ? (
                <Link
                  href={`/corsi/${slug}/${nextLesson.slug}`}
                  className="group flex flex-col items-end gap-0.5 text-right"
                >
                  <span className="flex items-center gap-1 text-xs text-zinc-500 transition group-hover:text-zinc-300">
                    Lezione successiva
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-medium page-heading transition group-hover:underline">
                    {nextLesson.title}
                  </span>
                </Link>
              ) : (
                <Link
                  href={`/corsi/${slug}`}
                  className="group flex flex-col items-end gap-0.5 text-right"
                >
                  <span className="flex items-center gap-1 text-xs text-zinc-500 transition group-hover:text-zinc-300">
                    Fine del corso
                    <BookOpen className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-medium page-heading transition group-hover:underline">
                    Torna al programma
                  </span>
                </Link>
              )}
            </nav>
          </div>

          {/* Sidebar — lesson list */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <h3 className="page-heading text-sm font-semibold uppercase tracking-wider">
                Programma
              </h3>
              <div className="space-y-1.5">
                {lessons.map((l) => {
                  const isCurrent = l.slug === lessonSlug;
                  return (
                    <Link
                      key={l.slug}
                      href={`/corsi/${slug}/${l.slug}`}
                      className={
                        isCurrent ? "lesson-item-active" : "lesson-item"
                      }
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-500">
                        {l.order}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">
                          {l.title}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                          {l.durationMinutes && <span>{l.durationMinutes}m</span>}
                          {l.quiz && (l.quiz as unknown[]).length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Quiz
                            </span>
                          )}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Back to course */}
              <Link
                href={`/corsi/${slug}`}
                className="back-link mt-4 flex items-center gap-1 text-xs"
              >
                <ArrowLeft className="h-3 w-3" />
                Torna al corso
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}
