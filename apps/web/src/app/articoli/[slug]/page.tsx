import { notFound } from "next/navigation";
import { getArticleBySlug, getStrapiMediaUrl, type Author } from "@/lib/api";
import { markdownToHtml } from "@/lib/markdown";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { Clock, Instagram, Linkedin, Globe, Music2 } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Articolo non trovato",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";
  const articleUrl = `${siteUrl}/articoli/${slug}`;
  
  // Usa metaImage dal SEO se disponibile, altrimenti heroImage, altrimenti logo
  const seoImageUrl = article.seo?.metaImage?.data?.attributes?.url
    ? getStrapiMediaUrl(article.seo.metaImage.data.attributes.url)
    : null;
  const heroImageUrl = article.heroImage?.data?.attributes?.url
    ? getStrapiMediaUrl(article.heroImage.data.attributes.url) || `${siteUrl}${article.heroImage.data.attributes.url}`
    : null;
  const imageUrl = seoImageUrl || heroImageUrl || `${siteUrl}/logo_capibara.png`;

  // Usa metaTitle dal SEO se disponibile, altrimenti title
  const metaTitle = article.seo?.metaTitle || article.title;
  
  // Usa metaDescription dal SEO se disponibile, altrimenti excerpt, altrimenti body
  const description = article.seo?.metaDescription || article.excerpt || article.body?.substring(0, 160) || "Leggi l'articolo completo su Capibara";

  // Usa keywords dal SEO se disponibile (stringa separata da virgole), altrimenti tags
  const seoKeywords = article.seo?.keywords
    ? article.seo.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : [];
  const tagKeywords = article.tags?.data?.map((tag) => tag.attributes.name) || [];
  const keywords = seoKeywords.length > 0 ? seoKeywords : tagKeywords;

  const author: Author | undefined =
    article.author?.data?.attributes || undefined;

  // Se preventIndexing è true, aggiungi noindex
  const robots = article.seo?.preventIndexing
    ? { index: false, follow: false }
    : { index: true, follow: true };

  return {
    metadataBase: new URL(siteUrl),
    title: metaTitle,
    description,
    keywords,
    authors: author ? [{ name: author.name }] : undefined,
    robots,
    openGraph: {
      type: "article",
      locale: "it_IT",
      url: articleUrl,
      siteName: "Capibara",
      title: metaTitle,
      description,
      publishedTime: article.publishDate || undefined,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.seo?.metaImage?.data?.attributes?.alternativeText || 
               article.heroImage?.data?.attributes?.alternativeText || 
               article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: articleUrl,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";
  const articleUrl = `${siteUrl}/articoli/${slug}`;
  const imageUrl = article.heroImage?.data?.attributes?.url
    ? getStrapiMediaUrl(article.heroImage.data.attributes.url) || `${siteUrl}${article.heroImage.data.attributes.url}`
    : `${siteUrl}/logo_capibara.png`;

  const author: Author | undefined =
    article.author?.data?.attributes || undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.body?.substring(0, 160) || "",
    image: imageUrl,
    datePublished: article.publishDate || undefined,
    author: author
      ? {
          "@type": "Person",
          name: author.name,
        }
      : {
          "@type": "Organization",
          name: "Capibara",
        },
    publisher: {
      "@type": "Organization",
      name: "Capibara",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo_capibara.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    keywords: article.tags?.data?.map((tag) => tag.attributes.name).join(", ") || undefined,
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-8">
        <Link
          href="/articoli"
          className="back-link"
        >
          ← Torna agli articoli
        </Link>

        <article className="space-y-8">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-wide meta-text">
              <span>Articolo</span>
              {article.isPremium && (
                <span className="locked-badge">
                  Abbonati
                </span>
              )}
            </div>
            <h1 className="page-title text-4xl font-semibold leading-tight">
              {article.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              {article.publishDate && (
                <span className="uppercase tracking-wide">
                  {new Date(article.publishDate).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
              {article.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readingTime} min di lettura
                </span>
              )}
              {author && (
                <span>di {author.name}</span>
              )}
            </div>
            {author && (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                {author.bio && (
                  <p className="max-w-xl text-xs text-zinc-500 dark:text-zinc-400">
                    {author.bio}
                  </p>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  {author.instagram && (
                    <a
                      href={author.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {author.tiktok && (
                    <a
                      href={author.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                      aria-label="TikTok"
                    >
                      <Music2 className="h-4 w-4" />
                    </a>
                  )}
                  {author.linkedin && (
                    <a
                      href={author.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {author.website && (
                    <a
                      href={author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                      aria-label="Sito personale"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {article.excerpt && (
            <p className="article-excerpt">{article.excerpt}</p>
          )}

          {article.heroImage?.data?.attributes?.url && (
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <img
                src={
                  getStrapiMediaUrl(article.heroImage.data.attributes.url) ??
                  article.heroImage.data.attributes.url
                }
                alt={article.heroImage.data.attributes.alternativeText || article.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {article.body && (
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(article.body) }}
            />
          )}

          {article.tags?.data && article.tags.data.length > 0 && (
            <div className="article-tags-container">
              {article.tags.data.map((tag) => (
                <span
                  key={tag.attributes.slug}
                  className="article-tag"
                >
                  {tag.attributes.name}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </MainLayout>
  );
}

