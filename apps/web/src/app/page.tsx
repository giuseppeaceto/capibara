import {
  getLatestPodcastEpisodes,
  getLatestVideoEpisodes,
  getPremiumNewsletterIssues,
  getLatestArticles,
  getLatestRubricaLinks,
  getRecentlyUpdatedColumns,
  extractHeroImage,
  type Show,
} from "@/lib/api";
import MainLayout from "@/components/MainLayout";
import ContentCard, { formatDate, getKindAccent } from "@/components/ContentCard";
import { extractAuthorData } from "@/components/RubricaCard";
import { toYoutubeEmbedUrl, getYoutubeThumbnailUrl, getVideoPreviewImageUrl } from "@/lib/youtube";
import { markdownToHtml } from "@/lib/markdown";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { type TickerItem } from "@/components/NewsTicker";

const RECENT_LINKS_PREVIEW = 3;

// Palette di colori per distinguere visivamente le rubriche (valori HEX, usati via inline style
// per avere la precedenza sui border definiti a livello di tema in .content-box)
const RUBRICA_BORDER_COLORS = [
  "#fbbf24", // amber-400
  "#34d399", // emerald-400
  "#38bdf8", // sky-400
  "#e879f9", // fuchsia-400
  "#fb7185", // rose-400
  "#a855f7", // violet-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#06b6d4", // cyan-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#ef4444", // red-500
  "#14b8a6", // teal-500
  "#6366f1", // indigo-500
] as const;

const getRubricaBorderColor = (
  slugOrTitle: string | null | undefined
): string | null => {
  if (!slugOrTitle) {
    return null;
  }

  // Genera un hash più robusto basato sullo slug/titolo della rubrica
  // Usa un algoritmo di hash più distribuito per evitare collisioni
  let hash = 0;
  for (let i = 0; i < slugOrTitle.length; i++) {
    const char = slugOrTitle.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Usa il valore assoluto per evitare indici negativi
  return RUBRICA_BORDER_COLORS[Math.abs(hash) % RUBRICA_BORDER_COLORS.length];
};

export const metadata: Metadata = {
  title: "Home",
  description:
    "Capibara è una media company indipendente: video, podcast, articoli e newsletter per raccontare lavoro, diritti, conflitti sociali e nuove forme di organizzazione. Storie da chi non ha potere.",
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: "Capibara",
    title: "Capibara - Storie da chi non ha potere",
    description:
      "Capibara è una media company indipendente: video, podcast, articoli e newsletter per raccontare lavoro, diritti, conflitti sociali e nuove forme di organizzazione.",
    images: [
      {
        url: new URL("/logo_capibara.png", process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media").toString(),
        width: 1200,
        height: 630,
        alt: "Capibara Logo",
      },
    ],
  },
};

// ISR: rigenera la homepage ogni 5 minuti (300 secondi)
// Questo riduce significativamente gli ISR writes su Vercel
export const revalidate = 300;

export default async function Home() {
  const [videoEpisodes, latestVideo, podcastDrops, premiumLetters, articles, latestRubricaLinks, recentlyUpdatedColumns] = await Promise.all([
    getLatestVideoEpisodes(3),
    getLatestVideoEpisodes(1), // Ultimo video per la sezione dedicata
    getLatestPodcastEpisodes(4),
    getPremiumNewsletterIssues(3),
    getLatestArticles(4),
    getLatestRubricaLinks(20), // Recupera molti link per garantire sempre 4 card in homepage
    getRecentlyUpdatedColumns(3),
  ]);

  // Filter out any undefined/null episodes
  const validVideoEpisodes = videoEpisodes.filter((ep) => ep != null);
  const latestVideoEpisode = latestVideo.length > 0 ? latestVideo[0] : null;
  const validPodcastDrops = podcastDrops.filter((ep) => ep != null);
  const validPremiumLetters = premiumLetters.filter((ep) => ep != null);
  const validArticles = articles.filter((art) => art != null);

  // Diversifica i link delle rubriche: priorità a rubriche diverse, ma riempie sempre 4 slot
  const diversifiedRubricaLinks = (() => {
    if (latestRubricaLinks.length === 0) return [];

    const linksByRubrica = new Map<string, typeof latestRubricaLinks>();
    latestRubricaLinks.forEach((link) => {
      const rubricaKey = link.column?.slug ?? link.column?.title ?? "unknown";
      if (!linksByRubrica.has(rubricaKey)) {
        linksByRubrica.set(rubricaKey, []);
      }
      linksByRubrica.get(rubricaKey)!.push(link);
    });

    const result: typeof latestRubricaLinks = [];
    const maxLinks = 4;
    const rubricas = Array.from(linksByRubrica.keys());

    // Round-robin: ad ogni passata prende il prossimo link da ogni rubrica
    let round = 0;
    while (result.length < maxLinks) {
      let addedThisRound = false;
      for (const rubricaKey of rubricas) {
        if (result.length >= maxLinks) break;
        const links = linksByRubrica.get(rubricaKey)!;
        if (round < links.length) {
          result.push(links[round]);
          addedThisRound = true;
        }
      }
      if (!addedThisRound) break;
      round++;
    }

    return result.slice(0, maxLinks);
  })();

  // --- Derived data for new layout ---
  const sortedArticles = [...validArticles].sort((a, b) => {
    const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
    const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
    return dateB - dateA;
  });
  const heroArticle = sortedArticles[0] ?? null;
  const remainingArticles = sortedArticles.slice(1);

  // Sezione 3: merge remaining articles + video episodes, sorted by date
  type MixedItem = { kind: "article" | "video"; date: number; data: any };
  const mixedContent: MixedItem[] = [
    ...remainingArticles.map((a) => ({
      kind: "article" as const,
      date: a.publishDate ? new Date(a.publishDate).getTime() : 0,
      data: a,
    })),
    ...validVideoEpisodes.map((v) => ({
      kind: "video" as const,
      date: v.publishDate ? new Date(v.publishDate).getTime() : 0,
      data: v,
    })),
  ].sort((a, b) => b.date - a.date);

  // Ticker: flusso ampio di contenuti recenti (articoli, rubriche, video, podcast)
  const tickerItems: TickerItem[] = [
    ...sortedArticles.map((a) => ({
      title: a.title ?? "Articolo",
      href: `/articoli/${a.slug}`,
      date: a.publishDate ? new Date(a.publishDate).getTime() : 0,
    })),
    ...latestRubricaLinks.map((l) => ({
      title: l.label,
      href: l.url,
      date: l.publishDate ? new Date(l.publishDate).getTime() : 0,
    })),
    ...validVideoEpisodes.map((v) => ({
      title: v.title ?? "Video",
      href: `/video/${v.slug}`,
      date: v.publishDate ? new Date(v.publishDate).getTime() : 0,
    })),
    ...validPodcastDrops.map((p) => ({
      title: p.title ?? "Podcast",
      href: `/podcast/${p.slug}`,
      date: p.publishDate ? new Date(p.publishDate).getTime() : 0,
    })),
  ]
    .sort((a, b) => b.date - a.date)
    .map(({ title, href }) => ({ title, href }));

  return (
    <MainLayout tickerItems={tickerItems}>
      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 0 — DALLE RUBRICHE (griglia compatta sopra la hero)
          Mini-card colorate con gli ultimi link dalle rubriche.
          ═══════════════════════════════════════════════════════════════ */}
      {diversifiedRubricaLinks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Dalle rubriche
              </h2>
            </div>
            <Link href="/newsroom" className="section-link text-xs font-medium">
              Tutte →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {diversifiedRubricaLinks.map((link, index) => {
              const columnTitle = link.column?.title || "Rubrica";
              const rubricaKey = link.column?.slug ?? columnTitle;
              const borderColor = getRubricaBorderColor(rubricaKey);

              return (
                <a
                  key={`rub-${link.column?.slug}-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="content-box group flex flex-col justify-between gap-3 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  style={
                    borderColor
                      ? { borderColor, borderWidth: "2px" }
                      : undefined
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider line-clamp-1"
                        style={borderColor ? { color: borderColor } : undefined}
                      >
                        {columnTitle}
                      </span>
                      <span className="flex-shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors text-xs">
                        ↗
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-zinc-900 dark:text-zinc-100">
                      {link.label}
                    </h3>
                  </div>
                  {link.publishDate && (
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                      {formatDate(link.publishDate)}
                    </p>
                  )}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 1 — HERO ARTICLE
          L'articolo più recente, full-bleed, senza header di sezione.
          ═══════════════════════════════════════════════════════════════ */}
      {heroArticle && (() => {
        const { url: imageUrl, alt: imageAlt } = extractHeroImage(heroArticle.heroImage);
        const author = extractAuthorData(heroArticle.author);
        const authorName = author?.name || null;
        const { url: authorAvatarUrl } = extractHeroImage(author?.avatar);

        return (
          <section>
            <Link
              href={`/articoli/${heroArticle.slug}`}
              className="content-box overflow-hidden hover:border-zinc-900 dark:hover:border-zinc-100 transition-all duration-200 group block p-0"
            >
              <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={imageAlt ?? heroArticle.title ?? "Articolo"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="100vw"
                    priority
                    unoptimized={imageUrl.includes("localhost") || imageUrl.includes("127.0.0.1")}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 lg:p-10">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/80">
                      <span>Articolo</span>
                      {heroArticle.publishDate && (
                        <>
                          <span>·</span>
                          <time dateTime={heroArticle.publishDate}>
                            {formatDate(heroArticle.publishDate)}
                          </time>
                        </>
                      )}
                    </div>

                    <h2 className="type-display text-white group-hover:text-white/90 transition-colors">
                      {heroArticle.title ?? "Untitled"}
                    </h2>

                    {heroArticle.excerpt && (
                      <p className="text-base sm:text-lg lg:text-xl text-white/85 leading-relaxed line-clamp-2">
                        {heroArticle.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-3 border-t border-white/20">
                      <div className="flex items-center gap-2">
                        {authorAvatarUrl && (
                          <Image
                            src={authorAvatarUrl}
                            alt={authorName ?? "Autore"}
                            width={36}
                            height={36}
                            className="rounded-full object-cover border-2 border-white/30"
                            unoptimized={authorAvatarUrl.includes("localhost") || authorAvatarUrl.includes("127.0.0.1")}
                          />
                        )}
                        {authorName && (
                          <span className="text-sm font-semibold text-white">
                            {authorName}
                          </span>
                        )}
                      </div>
                      <span className="ml-auto text-sm font-medium text-white/80 group-hover:text-white transition-colors flex items-center gap-2">
                        Leggi l&apos;articolo
                        <span className="text-lg">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 2 — ULTIMO VIDEO (embed + body, mantenuto)
          Header ridotto con type-section.
          ═══════════════════════════════════════════════════════════════ */}
      {latestVideoEpisode && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow eyebrow--originals mb-1">Capibara Originals</p>
              <h2 className="type-section section-heading">Ultimo video</h2>
            </div>
            <Link href="/video" className="section-link font-medium">
              Tutti i video →
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 space-y-4">
              <div>
                <h3 className="text-xl font-semibold leading-tight mb-1">
                  <Link
                    href={`/video/${latestVideoEpisode.slug}`}
                    className="hover:underline decoration-2 underline-offset-4"
                  >
                    {latestVideoEpisode.title ?? "Untitled"}
                  </Link>
                </h3>
                {latestVideoEpisode.publishDate && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatDate(latestVideoEpisode.publishDate)}
                  </p>
                )}
              </div>
              {latestVideoEpisode.videoUrl && (() => {
                const isVertical =
                  latestVideoEpisode.videoOrientation === "vertical" ||
                  (latestVideoEpisode.videoUrl?.includes("/shorts/") ?? false);
                const isYouTube = toYoutubeEmbedUrl(latestVideoEpisode.videoUrl) !== null;
                const embedSrc = toYoutubeEmbedUrl(latestVideoEpisode.videoUrl) ?? latestVideoEpisode.videoUrl ?? undefined;

                if (isYouTube && embedSrc) {
                  return (
                    <div
                      className={`relative overflow-hidden rounded-2xl bg-black ${
                        isVertical ? "mx-auto max-w-sm aspect-[9/16]" : "w-full aspect-video"
                      }`}
                    >
                      <iframe
                        src={embedSrc}
                        className="absolute inset-0 h-full w-full border-0"
                        style={{ overflow: "hidden", border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        scrolling="no"
                      />
                    </div>
                  );
                }

                const thumbnailUrl =
                  getYoutubeThumbnailUrl(latestVideoEpisode.videoUrl, "maxresdefault") ??
                  getYoutubeThumbnailUrl(latestVideoEpisode.videoUrl, "hqdefault");
                const { url: heroImageUrl } = extractHeroImage(latestVideoEpisode.heroImage);
                const posterUrl = thumbnailUrl ?? heroImageUrl ?? undefined;

                return (
                  <div
                    className={`overflow-hidden rounded-2xl bg-black ${
                      isVertical ? "mx-auto max-w-sm aspect-[9/16]" : "w-full aspect-video"
                    }`}
                  >
                    <video
                      src={latestVideoEpisode.videoUrl}
                      controls
                      preload="metadata"
                      poster={posterUrl}
                      className="h-full w-full"
                    >
                      Il tuo browser non supporta il tag video.
                    </video>
                  </div>
                );
              })()}
            </div>

            <div className="w-full lg:w-2/3 space-y-4">
              {latestVideoEpisode.body ? (
                <div
                  className="article-prose prose prose-zinc dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(latestVideoEpisode.body),
                  }}
                />
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 3 — ULTIMI CONTENUTI (articoli + video mescolati)
          Griglia unica ordinata per data.
          ═══════════════════════════════════════════════════════════════ */}
      {mixedContent.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow eyebrow--brand mb-1">Da non perdere</p>
              <h2 className="type-section section-heading">Ultimi contenuti</h2>
            </div>
            <Link href="/archivio" className="section-link font-medium">
              Archivio →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mixedContent.slice(0, 6).map((item) => {
              if (item.kind === "article") {
                const article = item.data;
                const { url, alt } = extractHeroImage(article.heroImage);
                const author = extractAuthorData(article.author);
                const authorName = author?.name || null;
                const { url: authorAvatarUrl } = extractHeroImage(author?.avatar);

                return (
                  <ContentCard
                    key={`a-${article.slug}`}
                    entry={{
                      title: article.title ?? "Untitled",
                      date: formatDate(article.publishDate),
                      summary: article.excerpt ?? "",
                      tag: "Articolo",
                      accent: "from-blue-500/30 via-indigo-500/20 to-purple-900/40",
                      imageUrl: url ?? undefined,
                      imageAlt: alt ?? article.title,
                      locked: article.isPremium ?? false,
                      slug: article.slug,
                      type: "article",
                      borderColor: "indigo-500",
                      authorName: authorName,
                      authorAvatar: authorAvatarUrl ?? undefined,
                    }}
                  />
                );
              }

              const episode = item.data;
              const showData = episode.show?.data;
              const showKind = (showData?.attributes?.kind as Show["kind"]) ?? "video";
              const accent = getKindAccent(showKind);
              const previewImageUrl = getVideoPreviewImageUrl(episode.videoUrl);
              const { url: heroImageUrl, alt: imageAltRaw } = extractHeroImage(episode.heroImage);

              return (
                <ContentCard
                  key={`v-${episode.slug}`}
                  entry={{
                    title: episode.title ?? "Untitled",
                    date: formatDate(episode.publishDate),
                    summary: episode.synopsis ?? episode.summary ?? "",
                    tag: "Video",
                    accent,
                    imageUrl: previewImageUrl ?? heroImageUrl ?? undefined,
                    imageAlt: imageAltRaw ?? episode.title ?? "Video",
                    locked: episode.isPremium ?? false,
                    slug: episode.slug,
                    type: "video",
                    borderColor: "purple-500",
                  }}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 4 — NEWSROOM (rubriche cover cards + link recenti)
          Fusione delle due vecchie sezioni rubriche.
          ═══════════════════════════════════════════════════════════════ */}
      {recentlyUpdatedColumns.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow eyebrow--newsletter mb-1">Newsroom</p>
              <h2 className="type-section section-heading">Dalle rubriche</h2>
            </div>
            <Link href="/newsroom" className="section-link font-medium">
              Tutte le rubriche →
            </Link>
          </div>

          {recentlyUpdatedColumns.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentlyUpdatedColumns.map((column) => {
                const { url: coverUrl, alt: coverAlt } = extractHeroImage(column.cover);
                const author = extractAuthorData(column.author);
                const authorName = author?.name || null;
                const recentLinks = (column.links || [])
                  .filter((link: any) => {
                    if (!link.publishDate) return false;
                    const linkDate = new Date(link.publishDate);
                    const now = new Date();
                    const sevenDaysAgo = new Date(now);
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return linkDate <= now && linkDate >= sevenDaysAgo;
                  })
                  .slice(0, RECENT_LINKS_PREVIEW);

                return (
                  <Link
                    key={column.slug}
                    href={`/newsroom?column=${column.slug}`}
                    className="content-box overflow-hidden hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors group"
                  >
                    {coverUrl && (
                      <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <Image
                          src={coverUrl}
                          alt={coverAlt || column.title}
                          width={640}
                          height={360}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized={coverUrl.includes("localhost") || coverUrl.includes("127.0.0.1")}
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-lg leading-tight group-hover:underline decoration-2 underline-offset-4">
                        {column.title}
                      </h3>
                      {authorName && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          di {authorName}
                        </p>
                      )}
                      {column.description && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-500 line-clamp-2 leading-relaxed">
                          {column.description}
                        </p>
                      )}
                      {recentLinks.length > 0 && (
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                            {recentLinks.length} {recentLinks.length === 1 ? "link recente" : "link recenti"}
                          </p>
                          <ul className="space-y-1">
                            {recentLinks.map((link: any, idx: number) => (
                              <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                                · {link.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 5 — SCOPRI (podcast + newsletter + mappa conflitti)
          ═══════════════════════════════════════════════════════════════ */}
      <section className={`grid gap-6 ${validPodcastDrops.length > 0 ? "lg:grid-cols-[1.25fr_0.75fr]" : "lg:grid-cols-1"}`}>
        {validPodcastDrops.length > 0 && (
          <div className="space-y-5 rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow eyebrow--podcast mb-1">Podcast</p>
                <h3 className="type-section section-heading">
                  {validPodcastDrops[0]?.show?.data?.attributes?.title || "Podcast"}
                </h3>
              </div>
              <span className="rss-badge">Feed RSS</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {validPodcastDrops.map((podcast) => {
                const { url, alt } = extractHeroImage(podcast.heroImage);
                return (
                  <ContentCard
                    key={podcast.slug}
                    entry={{
                      title: podcast.title ?? "Untitled",
                      date: formatDate(podcast.publishDate),
                      summary: podcast.summary ?? podcast.synopsis ?? "",
                      tag: "Podcast",
                      accent: getKindAccent("podcast"),
                      imageUrl: url ?? undefined,
                      imageAlt: alt ?? podcast.title,
                      locked: podcast.isPremium ?? false,
                      slug: podcast.slug,
                      type: "podcast",
                      borderColor: "teal-500",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
        <div className="space-y-5 rounded-3xl border border-white/10 p-6">
          <div>
            <p className="eyebrow eyebrow--newsletter mb-1">Newsletter</p>
            <h3 className="type-section section-heading">Area riservata</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Inchieste lunghe, approfondimenti teorici e strumenti pratici per chi vuole
              organizzarsi nei luoghi di lavoro, nelle città, nei movimenti. Sostieni
              un progetto editoriale che non dipende da partiti né da grandi gruppi.
            </p>
          </div>
          <div className="space-y-4">
            {validPremiumLetters.map((letter) => {
              const { url, alt } = extractHeroImage(letter.heroImage);
              return (
                <ContentCard
                  key={letter.slug}
                  entry={{
                    title: letter.title ?? "Untitled",
                    date: formatDate(letter.publishDate),
                    summary: letter.excerpt ?? letter.summary ?? "",
                    tag: "Newsroom",
                    accent: getKindAccent("newsroom"),
                    imageUrl: url ?? undefined,
                    imageAlt: alt ?? letter.title,
                    locked: letter.isPremium ?? true,
                    slug: letter.slug,
                    type: "newsroom",
                  }}
                />
              );
            })}
          </div>
          <button className="benefit-button">
            Esplora i benefit per gli abbonati →
          </button>
        </div>
      </section>

      {/* Mappa dei Conflitti */}
      <section>
        <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/5 via-transparent to-red-900/10 p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <p className="eyebrow eyebrow--brand">Capibara · Strumenti</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
                In Sperimentazione
              </span>
            </div>
            <h3 className="type-section section-heading mb-3">
              Mappa Interattiva dei Conflitti Mondiali
            </h3>
            <p className="text-base text-zinc-700 dark:text-zinc-300 mb-6 max-w-2xl">
              Visualizza tutti i conflitti armati attivi nel mondo su una mappa interattiva.
              Dati aggiornati dal database dell&apos;Uppsala Conflict Data Program (UCDP).
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/conflitti"
                className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
              >
                Esplora la mappa →
              </Link>
              <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>50+ conflitti mappati</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Dati UCDP 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
