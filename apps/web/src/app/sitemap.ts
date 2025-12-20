import { MetadataRoute } from "next";
import {
  getLatestArticles,
  getLatestVideoEpisodes,
  getLatestPodcastEpisodes,
} from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";

  // Ottieni tutti i contenuti (usiamo limit alto per ottenere tutto)
  const [articles, videos, podcasts] = await Promise.all([
    getLatestArticles(1000),
    getLatestVideoEpisodes(1000),
    getLatestPodcastEpisodes(1000),
  ]);

  // Pagine statiche
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/articoli`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/video`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/podcast`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/newsletter`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/archivio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/chi-siamo`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/abbonamenti`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/partner`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Articoli
  const articlePages: MetadataRoute.Sitemap = articles
    .filter((article) => article && article.slug)
    .map((article) => ({
      url: `${siteUrl}/articoli/${article.slug}`,
      lastModified: article.publishDate ? new Date(article.publishDate) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Video
  const videoPages: MetadataRoute.Sitemap = videos
    .filter((video) => video && video.slug)
    .map((video) => ({
      url: `${siteUrl}/video/${video.slug}`,
      lastModified: video.publishDate ? new Date(video.publishDate) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Podcast
  const podcastPages: MetadataRoute.Sitemap = podcasts
    .filter((podcast) => podcast && podcast.slug)
    .map((podcast) => ({
      url: `${siteUrl}/podcast/${podcast.slug}`,
      lastModified: podcast.publishDate ? new Date(podcast.publishDate) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...articlePages, ...videoPages, ...podcastPages];
}

