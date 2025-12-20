import {
  getLatestPodcastEpisodes,
  getLatestVideoEpisodes,
  getPremiumNewsletterIssues,
  getLatestArticles,
  extractHeroImage,
  type Show,
} from "@/lib/api";
import MainLayout from "@/components/MainLayout";
import ContentCard, { formatDate, getKindAccent } from "@/components/ContentCard";
import Link from "next/link";
import type { Metadata } from "next";

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
        url: "/logo_capibara.png",
        width: 1200,
        height: 630,
        alt: "Capibara Logo",
      },
    ],
  },
};

export default async function Home() {
  const [videoEpisodes, podcastDrops, premiumLetters, articles] = await Promise.all([
    getLatestVideoEpisodes(3),
    getLatestPodcastEpisodes(4),
    getPremiumNewsletterIssues(3),
    getLatestArticles(3),
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
                  // Estrai il nome dell'autore da diverse possibili strutture
                  const authorName = 
                    article.author?.data?.attributes?.name ||
                    (article.author as any)?.attributes?.name ||
                    (article.author as any)?.name ||
                    null;

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
                      }}
                    />
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
              {validVideoEpisodes.map((episode) => {
                const showData = episode.show?.data;
                const showKind = 
                  (showData?.attributes?.kind as Show["kind"]) ?? "video";
                const accent = getKindAccent(showKind);

                // Debug: log heroImage structure lato server
                if (process.env.NODE_ENV === 'development') {
                  console.log('Video episode heroImage:', {
                    slug: episode.slug,
                    hasHeroImage: !!episode.heroImage,
                    heroImage: episode.heroImage,
                    hasData: !!episode.heroImage?.data,
                    data: episode.heroImage?.data,
                    hasAttributes: !!episode.heroImage?.data?.attributes,
                    url: episode.heroImage?.data?.attributes?.url,
                  });
                }

                // Estrae URL e alt da qualsiasi struttura di media supportata
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
                      tag: "Newsletter",
                      accent: getKindAccent("newsletter"),
                      imageUrl: url ?? undefined,
                      imageAlt: alt ?? letter.title,
                      locked: letter.isPremium ?? true,
                      slug: letter.slug,
                      type: "newsletter",
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
    </MainLayout>
  );
}
