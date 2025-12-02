import { Suspense } from "react";
import MainLayout from "@/components/MainLayout";
import ArchivioContent from "./ArchivioContent";
import {
  getLatestVideoEpisodes,
  getLatestPodcastEpisodes,
  getPremiumNewsletterIssues,
  getLatestArticles,
} from "@/lib/api";

export default async function ArchivioPage() {
  const [videos, podcasts, newsletters, articles] = await Promise.all([
    getLatestVideoEpisodes(6),
    getLatestPodcastEpisodes(6),
    getPremiumNewsletterIssues(6),
    getLatestArticles(6),
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
        />
      </Suspense>
    </MainLayout>
  );
}

