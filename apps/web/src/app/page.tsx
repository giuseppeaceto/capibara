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
import Link from "next/link";
import type { Metadata } from "next";

// Constants
const LATEST_RUBRICA_LINKS_DISPLAY = 6;
const RECENT_LINKS_PREVIEW = 3;

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

export default async function Home() {
  const [videoEpisodes, podcastDrops, premiumLetters, articles, latestRubricaLinks, recentlyUpdatedColumns] = await Promise.all([
    getLatestVideoEpisodes(3),
    getLatestPodcastEpisodes(4),
    getPremiumNewsletterIssues(3),
    getLatestArticles(3),
    getLatestRubricaLinks(5),
    getRecentlyUpdatedColumns(3),
  ]);

  // Filter out any undefined/null episodes
  const validVideoEpisodes = videoEpisodes.filter((ep) => ep != null);
  const validPodcastDrops = podcastDrops.filter((ep) => ep != null);
  const validPremiumLetters = premiumLetters.filter((ep) => ep != null);
  const validArticles = articles.filter((art) => art != null);

  return (
    <MainLayout>
      <header className="hero flex flex-col rounded-3xl border p-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-8 lg:flex-row lg:items-end">
          <div className="flex-1">
            <p className="eyebrow eyebrow--brand">
              Capibara • informazione
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
              Storie, analisi e inchieste per chi guarda il mondo dal basso.
            </h2>
            <p className="mt-4 max-w-xl">
              Capibara è una media company indipendente: video, podcast, articoli e newsletter
              per raccontare lavoro, diritti, conflitti sociali e nuove forme di organizzazione.
              Niente terzismi: scegliamo un punto di vista, quello di chi non ha potere.
            </p>
          </div>
          <div className="mt-6 flex w-full justify-start lg:mt-0 lg:w-auto lg:justify-end">
            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center hero-buttons">
              <Link
                href="/abbonamenti"
                className="hero-button-primary"
              >
                Abbonati ora
              </Link>
              <Link
                href="/login"
                className="hero-button-secondary"
              >
                Accedi
              </Link>
            </div>
          </div>
        </div>
      </header>

          {validArticles.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow eyebrow--editorial">Editoriale</p>
                  <h3 className="section-heading text-2xl font-semibold">
                    Articoli e approfondimenti di parte
                  </h3>
                </div>
                <Link
                  href="/articoli"
                  className="section-link"
                >
                  Vedi tutto
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {validArticles.map((article) => {
                  const { url, alt } = extractHeroImage(article.heroImage);
                  const author = extractAuthorData(article.author);
                  const authorName = author?.name || null;
                  const { url: authorAvatarUrl } = extractHeroImage(author?.avatar);

                  return (
                    <ContentCard
                      key={article.slug}
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
                })}
              </div>
            </section>
          )}

          {/* Sezione Newsroom - Ultimi link dalle rubriche */}
          {latestRubricaLinks.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow eyebrow--newsletter">Newsroom</p>
                  <h3 className="section-heading text-2xl font-semibold">
                    Dalle rubriche
                  </h3>
                </div>
                <Link
                  href="/newsroom"
                  className="section-link"
                >
                  Vedi tutto
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {latestRubricaLinks.slice(0, LATEST_RUBRICA_LINKS_DISPLAY).map((link, index) => {
                  const author = extractAuthorData(link.author || link.column?.author);
                  const authorName = author?.name || null;
                  const columnTitle = link.column?.title || "Rubrica";
                  
                  return (
                    <div
                      key={`${link.column?.slug}-${index}`}
                      className="content-box p-5 space-y-3 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-lg leading-tight hover:underline decoration-2 underline-offset-4 line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors"
                          >
                            {link.label}
                          </a>
                          {link.description && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                              {link.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="font-medium">{columnTitle}</span>
                          {authorName && (
                            <>
                              <span>•</span>
                              <span>{authorName}</span>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-zinc-400">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Sezione Rubriche Aggiornate */}
          {recentlyUpdatedColumns.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow eyebrow--newsletter">Newsroom</p>
                  <h3 className="section-heading text-2xl font-semibold">
                    Rubriche aggiornate
                  </h3>
                </div>
                <Link
                  href="/newsroom"
                  className="section-link"
                >
                  Vedi tutte le rubriche
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recentlyUpdatedColumns.map((column) => {
                  const { url: coverUrl, alt: coverAlt } = extractHeroImage(column.cover);
                  const author = extractAuthorData(column.author);
                  const authorName = author?.name || null;
                  
                  // Get recent links (already filtered by getRecentlyUpdatedColumns, but we show preview)
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
                          <img
                            src={coverUrl}
                            alt={coverAlt || column.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-xl leading-tight group-hover:underline decoration-2 underline-offset-4">
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
                              {recentLinks.length} {recentLinks.length === 1 ? 'link recente' : 'link recenti'}
                            </p>
                            <ul className="space-y-1">
                              {recentLinks.map((link: any, idx: number) => (
                                <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                                  • {link.label}
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
            </section>
          )}

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow eyebrow--originals">Capibara Originals</p>
                <h3 className="section-heading text-2xl font-semibold">
                  Storied Network
                </h3>
              </div>
              <Link
                href="/video"
                className="section-link"
              >
                Vedi tutto
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {validVideoEpisodes
                .sort((a, b) => {
                  const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
                  const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
                  return dateB - dateA; // Most recent first
                })
                .map((episode) => {
                const showData = episode.show?.data;
                const showKind = 
                  (showData?.attributes?.kind as Show["kind"]) ?? "video";
                const accent = getKindAccent(showKind);
                const { url: imageUrl, alt: imageAltRaw } = extractHeroImage(episode.heroImage);
                const imageAlt = imageAltRaw ?? episode.title;

                return (
                  <ContentCard
                    key={episode.slug}
                    entry={{
                      title: episode.title ?? "Untitled",
                      date: formatDate(episode.publishDate),
                      summary: episode.synopsis ?? episode.summary ?? "",
                      tag: "Video",
                      accent,
                      imageUrl: imageUrl ?? undefined,
                      imageAlt,
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

          <section className={`grid gap-6 ${validPodcastDrops.length > 0 ? 'lg:grid-cols-[1.25fr_0.75fr]' : 'lg:grid-cols-1'}`}>
            {validPodcastDrops.length > 0 && (
              <div className="space-y-6 rounded-3xl border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow eyebrow--podcast">Podcast</p>
                    <h3 className="section-heading text-2xl font-semibold">
                      {validPodcastDrops[0]?.show?.data?.attributes?.title || "Podcast"}
                    </h3>
                  </div>
                  <span className="rss-badge">
                    Feed RSS
                  </span>
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
            <div className="space-y-6 rounded-3xl border border-white/10 p-6">
              <div>
                <p className="eyebrow eyebrow--newsletter">Newsletter</p>
                <h3 className="section-heading text-2xl font-semibold">
                  Area riservata
                </h3>
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

          {/* Teaser Mappa dei Conflitti */}
          <section className="space-y-6">
            <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/5 via-transparent to-red-900/10 p-8 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <p className="eyebrow eyebrow--brand">Capibara • Strumenti</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
                    🔬 In Sperimentazione
                  </span>
                </div>
                <h3 className="text-3xl font-semibold leading-tight mb-4">
                  Mappa Interattiva dei Conflitti Mondiali
                </h3>
                <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6 max-w-2xl">
                  Visualizza tutti i conflitti armati attivi nel mondo su una mappa interattiva. 
                  Dati aggiornati dal database dell'Uppsala Conflict Data Program (UCDP).
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
