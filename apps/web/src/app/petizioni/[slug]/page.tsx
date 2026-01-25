import { notFound } from "next/navigation";
import { getPetitionBySlug, getStrapiMediaUrl, extractHeroImage, type Author } from "@/lib/api";
import { markdownToHtml } from "@/lib/markdown";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { Calendar, ExternalLink, Users } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const petition = await getPetitionBySlug(slug);

  if (!petition) {
    return {
      title: "Petizione non trovata",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";
  const petitionUrl = `${siteUrl}/petizioni/${slug}`;
  
  // Helper per garantire URL assoluto per Open Graph
  const ensureAbsoluteUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return url.startsWith("/") ? `${siteUrl}${url}` : `${siteUrl}/${url}`;
  };
  
  // Usa metaImage dal SEO se disponibile, altrimenti heroImage, altrimenti logo
  const seoImageUrl = petition.seo?.metaImage?.data?.attributes?.url
    ? ensureAbsoluteUrl(getStrapiMediaUrl(petition.seo.metaImage.data.attributes.url))
    : null;
  const { url: heroImageUrl } = extractHeroImage(petition.heroImage);
  const imageUrl = seoImageUrl || ensureAbsoluteUrl(heroImageUrl) || `${siteUrl}/logo_capibara.png`;

  // Usa metaTitle dal SEO se disponibile, altrimenti title
  const metaTitle = petition.seo?.metaTitle || petition.title;
  
  // Usa metaDescription dal SEO se disponibile, altrimenti description, altrimenti body
  const description = petition.seo?.metaDescription || petition.description || petition.body?.substring(0, 160) || "Firma la petizione su Capibara";

  // Usa keywords dal SEO se disponibile (stringa separata da virgole), altrimenti tags
  const seoKeywords = petition.seo?.keywords
    ? petition.seo.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : [];
  const tagKeywords = petition.tags?.data?.map((tag) => tag.attributes.name) || [];
  const keywords = seoKeywords.length > 0 ? seoKeywords : tagKeywords;

  // Estrai l'autore da diverse possibili strutture
  const author: Author | undefined =
    petition.author?.data?.attributes ||
    (petition.author as any)?.attributes ||
    (petition.author as any) ||
    undefined;

  // Se preventIndexing è true, aggiungi noindex
  const robots = petition.seo?.preventIndexing
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
      url: petitionUrl,
      siteName: "Capibara",
      title: metaTitle,
      description,
      publishedTime: petition.publishDate || undefined,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: petition.seo?.metaImage?.data?.attributes?.alternativeText || 
               petition.heroImage?.data?.attributes?.alternativeText || 
               petition.title,
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
      canonical: petitionUrl,
    },
  };
}

export default async function PetitionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const petition = await getPetitionBySlug(slug);

  if (!petition) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";
  const petitionUrl = `${siteUrl}/petizioni/${slug}`;
  const imageUrl = petition.heroImage?.data?.attributes?.url
    ? getStrapiMediaUrl(petition.heroImage.data.attributes.url) || `${siteUrl}${petition.heroImage.data.attributes.url}`
    : `${siteUrl}/logo_capibara.png`;

  // Estrai l'autore da diverse possibili strutture
  const author: Author | undefined =
    petition.author?.data?.attributes ||
    (petition.author as any)?.attributes ||
    (petition.author as any) ||
    undefined;

  // Calcola la percentuale di completamento
  const targetSignatures = petition.targetSignatures || 1000;
  const currentSignatures = petition.currentSignatures || 0;
  const percentage = Math.min(100, Math.round((currentSignatures / targetSignatures) * 100));

  // Verifica se la petizione è scaduta
  const isExpired = petition.expiryDate 
    ? new Date(petition.expiryDate) < new Date()
    : false;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: petition.title,
    description: petition.description || petition.body?.substring(0, 160) || "",
    image: imageUrl,
    datePublished: petition.publishDate || undefined,
    dateModified: petition.expiryDate || undefined,
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
      "@id": petitionUrl,
    },
    keywords: petition.tags?.data?.map((tag) => tag.attributes.name).join(", ") || undefined,
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-8">
        <Link
          href="/petizioni"
          className="back-link"
        >
          ← Torna alle petizioni
        </Link>

        <article className="space-y-8">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-wide meta-text">
              <span>Petizione</span>
              {!petition.isActive && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Chiusa
                </span>
              )}
              {isExpired && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
                  Scaduta
                </span>
              )}
            </div>
            <h1 className="page-title text-4xl font-semibold leading-tight">
              {petition.title}
            </h1>
            {author && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">di</span>
                {author.avatar && (
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                    <Image
                      src={extractHeroImage(author.avatar).url ?? ""}
                      alt={author.name}
                      width={24}
                      height={24}
                      className="w-full h-full object-contain translate-y-1.5 scale-110"
                      unoptimized={extractHeroImage(author.avatar).url?.includes('localhost') || extractHeroImage(author.avatar).url?.includes('127.0.0.1')}
                    />
                  </div>
                )}
                <span className="font-medium author-name">{author.name}</span>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              {petition.publishDate && (
                <span className="uppercase tracking-wide">
                  {new Date(petition.publishDate).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
              {petition.expiryDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Scade il {new Date(petition.expiryDate).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Barra di progresso firme */}
          <div className="content-box p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                <span className="text-lg font-semibold">Firme raccolte</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {currentSignatures.toLocaleString()}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  di {targetSignatures.toLocaleString()} obiettivo
                </div>
              </div>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-red-600 dark:bg-red-500 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                {percentage}% completato
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                Mancano {Math.max(0, targetSignatures - currentSignatures).toLocaleString()} firme
              </span>
            </div>
            {petition.externalUrl && petition.isActive && !isExpired && (
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <a
                  href={petition.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                >
                  <span>Firma la petizione</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>

          {petition.description && (
            <p className="article-excerpt">{petition.description}</p>
          )}

          {petition.heroImage?.data?.attributes?.url && (
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <img
                src={
                  getStrapiMediaUrl(petition.heroImage.data.attributes.url) ??
                  petition.heroImage.data.attributes.url
                }
                alt={petition.heroImage.data.attributes.alternativeText || petition.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {petition.body ? (
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(petition.body) }}
            />
          ) : null}

          {petition.tags?.data && petition.tags.data.length > 0 && (
            <div className="article-tags-container">
              {petition.tags.data.map((tag) => (
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
