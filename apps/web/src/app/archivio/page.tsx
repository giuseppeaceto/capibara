import { Suspense } from "react";
import MainLayout from "@/components/MainLayout";
import ArchivioContent from "./ArchivioContent";
import {
  getLatestVideoEpisodes,
  getLatestPodcastEpisodes,
  getPremiumNewsletterIssues,
  getLatestArticles,
  getColumns,
  getPublishedRubricaLinks,
} from "@/lib/api";

// ISR: rigenera l'archivio ogni 10 minuti (600 secondi)
// L'archivio cambia meno frequentemente della homepage
export const revalidate = 600;

export default async function ArchivioPage() {
  const [videos, podcasts, newsletters, articles, columns, rubricaLinks] = await Promise.all([
    getLatestVideoEpisodes(6),
    getLatestPodcastEpisodes(6),
    getPremiumNewsletterIssues(6),
    getLatestArticles(6),
    getColumns(),
    getPublishedRubricaLinks(), // Senza limite per mostrare tutti i link pubblicati
  ]);

  return (
    <MainLayout>
      <Suspense
        fallback={
        <div className="space-y-8">
          <div>
            <h1 className="page-title text-4xl font-semibold">Archivio</h1>
            <p className="mt-2 text-zinc-400">
              Cerca tra tutti i contenuti di Capibara Media
            </p>
          </div>
        </div>
        }
      >
        <ArchivioContent
          initialVideos={videos}
          initialPodcasts={podcasts}
          initialNewsletters={newsletters}
          initialArticles={articles}
          initialColumns={columns}
          initialRubricaLinks={rubricaLinks}
        />
      </Suspense>
    </MainLayout>
  );
}

