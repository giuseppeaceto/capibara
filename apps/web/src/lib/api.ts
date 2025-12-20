// Tipizzazione minimale di `process.env` per evitare errori di lint/TS
declare const process: {
  env: Record<string, string | undefined>;
};

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "https://capibara-1z0m.onrender.com";

// Helper per costruire le URL complete dei media di Strapi (immagini, ecc.)
export function getStrapiMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${STRAPI_URL}${path}`;
}

// Helper generico per estrarre heroImage da strutture diverse (Strapi 4/5, singolo o array)
export function extractHeroImage(
  media: unknown,
): { url: string | null; alt: string | null } {
  if (!media) {
    return { url: null, alt: null };
  }

  const m: any = media;

  // Caso 1: struttura { data: { attributes: { url, alternativeText } } }
  if (m.data?.attributes?.url) {
    return {
      url: getStrapiMediaUrl(m.data.attributes.url),
      alt: m.data.attributes.alternativeText ?? null,
    };
  }

  // Caso 2: media singolo: { url, alternativeText, ... }
  if (m.url) {
    return {
      url: getStrapiMediaUrl(m.url),
      alt: m.alternativeText ?? null,
    };
  }

  // Caso 3: array di media: [{ url, alternativeText, ... }]
  if (Array.isArray(m) && m[0]?.url) {
    return {
      url: getStrapiMediaUrl(m[0].url),
      alt: m[0].alternativeText ?? null,
    };
  }

  // Caso 4: struttura { data: [{ attributes: { url, alternativeText } }, ...] }
  if (Array.isArray(m.data) && m.data[0]?.attributes?.url) {
    return {
      url: getStrapiMediaUrl(m.data[0].attributes.url),
      alt: m.data[0].attributes.alternativeText ?? null,
    };
  }

  return { url: null, alt: null };
}

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

type FetchOptions = {
  cache?: RequestCache;
  revalidate?: number;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
};

type StrapiCollectionResponse<T> = {
  data: Array<{
    id: number;
    attributes: T;
  }>;
};

const toQueryString = (params: Record<string, string | number | boolean | undefined> = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.append(key, String(value));
  });
  return query.toString();
};

async function strapiFetch<T>(
  path: string,
  { cache = "force-cache", revalidate = 60, headers, query }: FetchOptions = {},
): Promise<T> {
  const qs = query ? `?${toQueryString(query)}` : "";
  const url = `${STRAPI_URL}${path}${qs}`;

  try {
    const res = await fetch(url, {
      cache,
      next: { revalidate },
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
    } as NextFetchInit);

    if (!res.ok) {
      // Don't log 403 as error if it's just permissions not configured yet
      if (res.status === 403) {
        console.warn(
          `⚠️ Strapi returned 403 for ${path}. Make sure to configure public permissions in Strapi admin:`,
          "\n  Settings > Users & Permissions > Roles > Public",
          "\n  Enable 'find' and 'findOne' for all content types"
        );
      } else {
        console.error(`Strapi request failed: ${res.status} ${res.statusText} for ${path}`);
      }
      // Return empty data structure instead of crashing
      return { data: [] } as T;
    }

    const data = await res.json();
    
    // Debug: log response structure in development
    if (process.env.NODE_ENV === 'development' && path.includes('episodes')) {
      console.log(`📦 Strapi response for ${path}:`, {
        dataLength: data.data?.length ?? 0,
        firstItem: data.data?.[0] ? {
          id: data.data[0].id,
          fullItem: data.data[0],
          hasAttributes: !!data.data[0].attributes,
          attributesKeys: data.data[0].attributes ? Object.keys(data.data[0].attributes) : [],
        } : null,
      });
    }
    
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's a connection error
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
      console.warn(
        `⚠️ Cannot connect to Strapi at ${STRAPI_URL}`,
        "\n  Make sure Strapi is running: cd apps/cms && npm run develop"
      );
    } else {
      console.error(`Failed to fetch from Strapi (${path}):`, error);
    }
    
    // Return empty data structure instead of crashing
    return { data: [] } as T;
  }
}

type Show = {
  title: string;
  slug: string;
  kind: "video" | "podcast" | "newsletter";
  tagline?: string | null;
  description?: string | null;
  accentColor?: string | null;
  cover?: {
    data: {
      attributes: {
        url: string;
        alternativeText?: string | null;
      };
    };
  } | null;
};

type EpisodeBase = {
  title: string;
  slug: string;
  synopsis?: string | null;
  summary?: string | null;
  publishDate?: string | null;
  isPremium?: boolean;
  heroImage?: {
    data: {
      attributes: {
        url: string;
        alternativeText?: string | null;
      };
    };
  } | null;
  show?: {
    data: {
      attributes: Pick<Show, "title" | "slug" | "kind">;
    } | null;
  };
  seo?: SeoComponent | null;
};

type VideoEpisode = EpisodeBase & {
  videoUrl: string;
  durationSeconds?: number | null;
};

type PodcastEpisode = EpisodeBase & {
  durationSeconds?: number | null;
  spotifyLink?: string | null;
  appleLink?: string | null;
  youtubeLink?: string | null;
};

type NewsletterIssue = EpisodeBase & {
  body?: string | null;
  excerpt?: string | null;
};

type Author = {
  name: string;
  bio?: string | null;
  location?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  website?: string | null;
  columns?: {
    data: Array<{
      attributes: {
        title: string;
        slug: string;
      };
    }>;
  } | null;
  avatar?: {
    data: {
      attributes: {
        url: string;
        alternativeText?: string | null;
      };
    };
  } | null;
};

type DailyLink = {
  title: string;
  url: string;
  description?: string | null;
  publishDate: string;
  image?: {
    data: {
      attributes: {
        url: string;
        alternativeText?: string | null;
      };
    };
  } | null;
};

type Column = {
  title: string;
  slug: string;
  description?: string | null;
  cover?: {
    data: {
      attributes: {
        url: string;
        alternativeText?: string | null;
      };
    };
  } | null;
  author?: {
    data: {
      attributes: Author;
    } | null;
  };
  links: Array<{
    label: string;
    url: string;
    description?: string | null;
  }>;
};

// Tipo per il componente SEO del plugin Strapi SEO
type SeoComponent = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  metaImage?: {
    data: {
      attributes: {
        url: string;
        alternativeText?: string | null;
      };
    } | null;
  } | null;
  structuredData?: Record<string, unknown> | null;
  preventIndexing?: boolean | null;
};

type Article = {
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  publishDate?: string | null;
  isPremium?: boolean;
  readingTime?: number | null;
  author?: {
    data: {
      attributes: Author;
    } | null;
  } | null;
  heroImage?: {
    data: {
      attributes: {
        url: string;
        alternativeText?: string | null;
      };
    };
  } | null;
  tags?: {
    data: Array<{
      attributes: {
        name: string;
        slug: string;
      };
    }>;
  } | null;
  seo?: SeoComponent | null;
};

export async function getFeaturedShows(limit = 4) {
  const response = await strapiFetch<StrapiCollectionResponse<Show>>(
    "/api/shows",
    {
      query: {
        "populate[0]": "cover",
        "populate[1]": "tags",
        "filters[isFeatured][$eq]": true,
        "pagination[pageSize]": limit,
        "sort[0]": "updatedAt:desc",
      },
      revalidate: 120,
    },
  );

  // Strapi 5 returns data in { id, attributes } format
  // Handle both cases: with attributes wrapper and without
  return (response.data?.map((item) => {
    // If item already has the structure we need, return it
    if (item.attributes) {
      return item.attributes;
    }
    // Otherwise, item might already be the attributes object
    return item;
  }) ?? []) as Show[];
}

export async function getLatestVideoEpisodes(limit = 6) {
  const response = await strapiFetch<StrapiCollectionResponse<VideoEpisode>>(
    "/api/video-episodes",
    {
      query: {
        populate: "*",
        "publicationState": "live",
        "pagination[pageSize]": limit,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 60,
    },
  );

  // Strapi 5 returns data in { id, attributes } format
  // Handle both cases: with attributes wrapper and without
  return (response.data?.map((item) => {
    // If item already has the structure we need, return it
    if (item.attributes) {
      return item.attributes;
    }
    // Otherwise, item might already be the attributes object
    return item;
  }) ?? []) as VideoEpisode[];
}

export async function getLatestPodcastEpisodes(limit = 4) {
  const response = await strapiFetch<StrapiCollectionResponse<PodcastEpisode>>(
    "/api/podcast-episodes",
    {
      query: {
        populate: "*",
        "publicationState": "live",
        "pagination[pageSize]": limit,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 60,
    },
  );

  // Strapi 5 returns data in { id, attributes } format
  // Handle both cases: with attributes wrapper and without
  return (response.data?.map((item) => {
    // If item already has the structure we need, return it
    if (item.attributes) {
      return item.attributes;
    }
    // Otherwise, item might already be the attributes object
    return item;
  }) ?? []) as PodcastEpisode[];
}

export async function getPremiumNewsletterIssues(limit = 3) {
  const response = await strapiFetch<StrapiCollectionResponse<NewsletterIssue>>(
    "/api/newsletter-issues",
    {
      query: {
        populate: "*",
        "publicationState": "live",
        "filters[isPremium][$eq]": true,
        "pagination[pageSize]": limit,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 120,
    },
  );

  // Strapi 5 returns data in { id, attributes } format
  // Handle both cases: with attributes wrapper and without
  return (response.data?.map((item) => {
    // If item already has the structure we need, return it
    if (item.attributes) {
      return item.attributes;
    }
    // Otherwise, item might already be the attributes object
    return item;
  }) ?? []) as NewsletterIssue[];
}

export async function getVideoEpisodeBySlug(slug: string) {
  const response = await strapiFetch<StrapiCollectionResponse<VideoEpisode>>(
    "/api/video-episodes",
    {
      query: {
        populate: "*",
        "publicationState": "live",
        "filters[slug][$eq]": slug,
      },
      revalidate: 60,
    },
  );

  const episode = response.data?.[0];
  return episode?.attributes ?? episode ?? null;
}

export async function getPodcastEpisodeBySlug(slug: string) {
  const response = await strapiFetch<StrapiCollectionResponse<PodcastEpisode>>(
    "/api/podcast-episodes",
    {
      query: {
        populate: "*",
        "publicationState": "live",
        "filters[slug][$eq]": slug,
      },
      revalidate: 60,
    },
  );

  const episode = response.data?.[0];
  return episode?.attributes ?? episode ?? null;
}

export async function getNewsletterIssueBySlug(slug: string) {
  const response = await strapiFetch<StrapiCollectionResponse<NewsletterIssue>>(
    "/api/newsletter-issues",
    {
      query: {
        populate: "*",
        "publicationState": "live",
        "filters[slug][$eq]": slug,
      },
      revalidate: 60,
    },
  );

  const issue = response.data?.[0];
  return issue?.attributes ?? issue ?? null;
}

export async function getLatestArticles(limit = 6) {
  const response = await strapiFetch<StrapiCollectionResponse<Article>>(
    "/api/articles",
    {
      query: {
        populate: "*",
        "publicationState": "live",
        "pagination[pageSize]": limit,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 60,
    },
  );

  return (response.data?.map((item) => {
    if (item.attributes) {
      return item.attributes;
    }
    return item;
  }) ?? []) as Article[];
}

export async function getArticles(page = 1, pageSize = 12) {
  const response = await strapiFetch<StrapiPaginatedResponse<Article>>(
    "/api/articles",
    {
      query: {
        "populate[0]": "author",
        "populate[1]": "heroImage",
        "populate[2]": "tags",
        "publicationState": "live",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 60,
    },
  );

  const articles = (response.data?.map((item) => {
    if (item.attributes) {
      return item.attributes;
    }
    return item;
  }) ?? []) as Article[];

  return {
    data: articles,
    pagination: response.meta?.pagination ?? {
      page: 1,
      pageSize,
      pageCount: 1,
      total: articles.length,
    },
  };
}

export async function getArticleBySlug(slug: string) {
  const response = await strapiFetch<StrapiCollectionResponse<Article>>(
    "/api/articles",
    {
      query: {
        "populate[0]": "author",
        "populate[1]": "heroImage",
        "populate[2]": "tags",
        "populate[3]": "seo",
        "populate[4]": "seo.metaImage",
        "publicationState": "live",
        "filters[slug][$eq]": slug,
      },
      revalidate: 60,
    },
  );

  const article = response.data?.[0];
  return article?.attributes ?? article ?? null;
}

// Listing functions with pagination
type PaginationMeta = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

type StrapiPaginatedResponse<T> = StrapiCollectionResponse<T> & {
  meta: {
    pagination: PaginationMeta;
  };
};

export async function getVideoEpisodes(page = 1, pageSize = 12) {
  const response = await strapiFetch<StrapiPaginatedResponse<VideoEpisode>>(
    "/api/video-episodes",
    {
      query: {
        populate: "*",
        "publicationState": "live",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 60,
    },
  );

  const episodes = (response.data?.map((item) => {
    if (item.attributes) {
      return item.attributes;
    }
    return item;
  }) ?? []) as VideoEpisode[];

  return {
    data: episodes,
    pagination: response.meta?.pagination ?? {
      page: 1,
      pageSize,
      pageCount: 1,
      total: episodes.length,
    },
  };
}

export async function getPodcastEpisodes(page = 1, pageSize = 12) {
  const response = await strapiFetch<StrapiPaginatedResponse<PodcastEpisode>>(
    "/api/podcast-episodes",
    {
      query: {
        populate: "*",
        "publicationState": "live",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 60,
    },
  );

  const episodes = (response.data?.map((item) => {
    if (item.attributes) {
      return item.attributes;
    }
    return item;
  }) ?? []) as PodcastEpisode[];

  return {
    data: episodes,
    pagination: response.meta?.pagination ?? {
      page: 1,
      pageSize,
      pageCount: 1,
      total: episodes.length,
    },
  };
}

export async function getNewsletterIssues(page = 1, pageSize = 12) {
  const response = await strapiFetch<StrapiPaginatedResponse<NewsletterIssue>>(
    "/api/newsletter-issues",
    {
      query: {
        populate: "*",
        "publicationState": "live",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 60,
    },
  );

  const issues = (response.data?.map((item) => {
    if (item.attributes) {
      return item.attributes;
    }
    return item;
  }) ?? []) as NewsletterIssue[];

  return {
    data: issues,
    pagination: response.meta?.pagination ?? {
      page: 1,
      pageSize,
      pageCount: 1,
      total: issues.length,
    },
  };
}

export async function getDailyLinks(date?: string) {
  const targetDate = date ?? new Date().toISOString().split('T')[0];
  const response = await strapiFetch<StrapiCollectionResponse<DailyLink>>(
    "/api/daily-links",
    {
      query: {
        "filters[publishDate][$eq]": targetDate,
        "publicationState": "live",
        "sort[0]": "createdAt:desc",
        "populate": "image",
      },
      revalidate: 60,
    }
  );

  return (response.data?.map((item) => {
    if (item.attributes) return item.attributes;
    return item;
  }) ?? []) as DailyLink[];
}

export async function getColumns() {
  const response = await strapiFetch<StrapiCollectionResponse<Column>>(
    "/api/columns",
    {
      query: {
        "populate[0]": "author",
        "populate[1]": "author.avatar",
        "populate[2]": "links",
        "populate[3]": "cover",
        "publicationState": "live",
        "sort[0]": "createdAt:desc",
      },
      revalidate: 60,
    }
  );

  return (response.data?.map((item) => {
    if (item.attributes) return item.attributes;
    return item;
  }) ?? []) as Column[];
}

// Search function
export async function searchContent(query: string, page = 1, pageSize = 12) {
  if (!query || query.trim().length === 0) {
    return {
      videos: [],
      podcasts: [],
      newsletters: [],
      articles: [],
      pagination: {
        page: 1,
        pageSize,
        pageCount: 1,
        total: 0,
      },
    };
  }

  const searchQuery = query.trim();
  const [videosRes, podcastsRes, newslettersRes, articlesRes] = await Promise.all([
    strapiFetch<StrapiPaginatedResponse<VideoEpisode>>(
      "/api/video-episodes",
      {
        query: {
          populate: "*",
          "publicationState": "live",
          "filters[$or][0][title][$containsi]": searchQuery,
          "filters[$or][1][synopsis][$containsi]": searchQuery,
          "filters[$or][2][summary][$containsi]": searchQuery,
          "pagination[page]": page,
          "pagination[pageSize]": pageSize,
          "sort[0]": "publishDate:desc",
        },
        revalidate: 60,
      },
    ),
    strapiFetch<StrapiPaginatedResponse<PodcastEpisode>>(
      "/api/podcast-episodes",
      {
        query: {
          populate: "*",
          "publicationState": "live",
          "filters[$or][0][title][$containsi]": searchQuery,
          "filters[$or][1][summary][$containsi]": searchQuery,
          "pagination[page]": page,
          "pagination[pageSize]": pageSize,
          "sort[0]": "publishDate:desc",
        },
        revalidate: 60,
      },
    ),
    strapiFetch<StrapiPaginatedResponse<NewsletterIssue>>(
      "/api/newsletter-issues",
      {
        query: {
          populate: "*",
          "publicationState": "live",
          "filters[$or][0][title][$containsi]": searchQuery,
          "filters[$or][1][excerpt][$containsi]": searchQuery,
          "pagination[page]": page,
          "pagination[pageSize]": pageSize,
          "sort[0]": "publishDate:desc",
        },
        revalidate: 60,
      },
    ),
    strapiFetch<StrapiPaginatedResponse<Article>>(
      "/api/articles",
      {
        query: {
          populate: "*",
          "publicationState": "live",
          "filters[$or][0][title][$containsi]": searchQuery,
          "filters[$or][1][excerpt][$containsi]": searchQuery,
          "filters[$or][2][body][$containsi]": searchQuery,
          "pagination[page]": page,
          "pagination[pageSize]": pageSize,
          "sort[0]": "publishDate:desc",
        },
        revalidate: 60,
      },
    ),
  ]);

  const videos = (videosRes.data?.map((item) => {
    if (item.attributes) return item.attributes;
    return item;
  }) ?? []) as VideoEpisode[];

  const podcasts = (podcastsRes.data?.map((item) => {
    if (item.attributes) return item.attributes;
    return item;
  }) ?? []) as PodcastEpisode[];

  const newsletters = (newslettersRes.data?.map((item) => {
    if (item.attributes) return item.attributes;
    return item;
  }) ?? []) as NewsletterIssue[];

  const articles = (articlesRes.data?.map((item) => {
    if (item.attributes) return item.attributes;
    return item;
  }) ?? []) as Article[];

  const total = (videosRes.meta?.pagination?.total ?? 0) +
    (podcastsRes.meta?.pagination?.total ?? 0) +
    (newslettersRes.meta?.pagination?.total ?? 0) +
    (articlesRes.meta?.pagination?.total ?? 0);

  return {
    videos,
    podcasts,
    newsletters,
    articles,
    pagination: {
      page,
      pageSize,
      pageCount: Math.max(
        videosRes.meta?.pagination?.pageCount ?? 1,
        podcastsRes.meta?.pagination?.pageCount ?? 1,
        newslettersRes.meta?.pagination?.pageCount ?? 1,
        articlesRes.meta?.pagination?.pageCount ?? 1,
      ),
      total,
    },
  };
}

export type {
  Show,
  VideoEpisode,
  PodcastEpisode,
  NewsletterIssue,
  Author,
  DailyLink,
  Column,
  Article,
  StrapiCollectionResponse,
  PaginationMeta,
};

// Authors
export async function getAuthors() {
  const response = await strapiFetch<StrapiCollectionResponse<Author>>(
    "/api/authors",
    {
      query: {
        "populate[0]": "avatar",
        "populate[1]": "columns",
        "publicationState": "live",
        "sort[0]": "name:asc",
      },
      revalidate: 300,
    },
  );

  return (response.data?.map((item) => {
    if (item.attributes) return item.attributes;
    return item;
  }) ?? []) as Author[];
}

