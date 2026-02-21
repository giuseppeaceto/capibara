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

const STRAPI_FETCH_TIMEOUT_MS = 15_000;
const STRAPI_MAX_RETRIES = 3;
const STRAPI_RETRY_BASE_DELAY_MS = 2_000;

async function strapiFetch<T>(
  path: string,
  { cache = "force-cache", revalidate = 300, headers, query }: FetchOptions = {},
): Promise<T> {
  const qs = query ? `?${toQueryString(query)}` : "";
  const url = `${STRAPI_URL}${path}${qs}`;

  if (process.env.NODE_ENV === 'development') {
    console.log(`Fetching from Strapi: ${path}`, { query });
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt < STRAPI_MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = STRAPI_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(`Retrying Strapi request ${path} (attempt ${attempt + 1}/${STRAPI_MAX_RETRIES}) after ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STRAPI_FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        cache,
        next: { revalidate },
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
      } as NextFetchInit);

      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          console.warn(`Strapi returned ${res.status} for ${path}, will retry...`);
          lastError = new Error(`${res.status} ${res.statusText}`);
          continue;
        }

        if (res.status === 403) {
          console.warn(
            `Strapi returned 403 for ${path}. Make sure to configure public permissions in Strapi admin:`,
            "\n  Settings > Users & Permissions > Roles > Public",
            "\n  Enable 'find' and 'findOne' for all content types"
          );
        } else if (res.status === 404) {
          console.warn(
            `Strapi returned 404 for ${path}. This endpoint might not exist yet.`,
            "\n  Make sure:",
            "\n  1. Strapi server is running and has been restarted after creating the content type",
            "\n  2. The content type is properly configured in Strapi",
            "\n  3. Public permissions are configured:",
            "\n     Settings > Users & Permissions > Roles > Public > [Content Type] > Enable 'find'"
          );
        } else {
          console.error(`Strapi request failed: ${res.status} ${res.statusText} for ${path}`);
        }
        return { data: [] } as T;
      }

      const data = await res.json();

      if (process.env.NODE_ENV === 'development') {
        console.log(`Strapi response for ${path}:`, {
          dataLength: Array.isArray(data.data) ? data.data.length : (data.data ? 1 : 0),
          hasMeta: !!data.meta,
          pagination: data.meta?.pagination,
        });
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      const errorMessage = error instanceof Error ? error.message : String(error);
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const isRetryable = isAbort || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed');

      if (isRetryable) {
        console.warn(
          `Strapi request for ${path} failed (${isAbort ? 'timeout' : 'connection error'}), attempt ${attempt + 1}/${STRAPI_MAX_RETRIES}`
        );
        continue;
      }

      console.error(`Failed to fetch from Strapi (${path}):`, error);
      return { data: [] } as T;
    }
  }

  console.error(`Strapi request for ${path} failed after ${STRAPI_MAX_RETRIES} attempts. Last error:`, lastError);
  return { data: [] } as T;
}

type Show = {
  title: string;
  slug: string;
  kind: "video" | "podcast" | "newsroom";
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
  // "horizontal" (16:9) o "vertical" (9:16), gestito da Strapi
  videoOrientation?: "horizontal" | "vertical" | null;
  body?: string | null;
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
    publishDate?: string | null;
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

type Petition = {
  title: string;
  slug: string;
  description?: string | null;
  body?: string | null;
  publishDate?: string | null;
  expiryDate?: string | null;
  targetSignatures?: number | null;
  currentSignatures?: number | null;
  isActive?: boolean;
  externalUrl?: string | null;
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

type Event = {
  title: string;
  slug: string;
  description?: string | null;
  body?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  address?: string | null;
  isOnline?: boolean;
  onlineUrl?: string | null;
  organizer?: string | null;
  externalUrl?: string | null;
  isFeatured?: boolean;
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
      revalidate: 300, // Video episodes: cache 5 minuti invece di 1 minuto
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
      revalidate: 300, // Podcast episodes: cache 5 minuti invece di 1 minuto
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
      revalidate: 600, // Newsletter premium cambiano raramente, cache più lunga
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
      revalidate: 3600, // Singoli episodi: cache 1 ora (cambiano raramente dopo pubblicazione)
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
      revalidate: 3600, // Singoli episodi: cache 1 ora (cambiano raramente dopo pubblicazione)
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
      revalidate: 3600, // Singole newsletter: cache 1 ora (cambiano raramente dopo pubblicazione)
    },
  );

  const issue = response.data?.[0];
  return issue?.attributes ?? issue ?? null;
}

export async function getLatestArticles(limit = 6) {
  const now = new Date().toISOString();
  const response = await strapiFetch<StrapiCollectionResponse<Article>>(
    "/api/articles",
    {
      query: {
        "populate[0]": "author",
        "populate[1]": "author.avatar",
        "populate[2]": "heroImage",
        "populate[3]": "tags",
        "publicationState": "live",
        "filters[publishDate][$lte]": now,
        "pagination[pageSize]": limit,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 300, // Articoli recenti: cache 5 minuti invece di 1 minuto
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
  const now = new Date().toISOString();
  const response = await strapiFetch<StrapiPaginatedResponse<Article>>(
    "/api/articles",
    {
      query: {
        "populate[0]": "author",
        "populate[1]": "author.avatar",
        "populate[2]": "heroImage",
        "populate[3]": "tags",
        "publicationState": "live",
        "filters[publishDate][$lte]": now,
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 300, // Lista articoli paginata: cache 5 minuti invece di 1 minuto
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
        "populate[1]": "author.avatar",
        "populate[2]": "heroImage",
        "populate[3]": "tags",
        "populate[4]": "seo",
        "populate[5]": "seo.metaImage",
        "publicationState": "live",
        "filters[slug][$eq]": slug,
      },
      revalidate: 3600, // Singoli articoli: cache 1 ora (cambiano raramente dopo pubblicazione)
    },
  );

  console.log('API Response for slug:', slug, {
    responseData: response.data,
    dataLength: response.data?.length,
    firstItem: response.data?.[0],
    firstItemAttributes: response.data?.[0]?.attributes,
  });

  const article = response.data?.[0];
  const result = article?.attributes ?? article ?? null;

  console.log('Final article result:', {
    result,
    hasBody: !!result?.body,
    bodyLength: result?.body?.length,
    bodyPreview: result?.body ? result.body.substring(0, 100) : null
  });

  return result;
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
      revalidate: 300, // Lista video paginata: cache 5 minuti invece di 1 minuto
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
      revalidate: 300, // Lista podcast paginata: cache 5 minuti invece di 1 minuto
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
      revalidate: 300, // Lista newsletter paginata: cache 5 minuti invece di 1 minuto
    },
  );

  // Debug in development
  if (process.env.NODE_ENV === 'development') {
    console.log('getNewsletterIssues response:', {
      hasData: !!response.data,
      dataLength: response.data?.length ?? 0,
      pagination: response.meta?.pagination,
    });
  }

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
      revalidate: 300, // Daily links: cache 5 minuti invece di 1 minuto
    }
  );

  // Debug in development
  if (process.env.NODE_ENV === 'development') {
    console.log('getDailyLinks response:', {
      targetDate,
      hasData: !!response.data,
      dataLength: response.data?.length ?? 0,
    });
  }

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
        "populate[0]": "links",
        "populate[1]": "author",
        "populate[2]": "author.avatar",
        "populate[3]": "cover",
        "publicationState": "live",
        "sort[0]": "publishedAt:desc",
        "sort[1]": "updatedAt:desc",
      },
      revalidate: 600, // Columns cambiano raramente, cache più lunga (10 minuti)
    }
  );

  // Debug in development
  if (process.env.NODE_ENV === 'development') {
    console.log('getColumns response:', {
      hasData: !!response.data,
      dataLength: response.data?.length ?? 0,
      firstItem: response.data?.[0] ? {
        id: response.data[0].id,
        hasAttributes: !!response.data[0].attributes,
        attributesKeys: response.data[0].attributes ? Object.keys(response.data[0].attributes) : [],
      } : null,
    });
  }

  // Always return an array, even if response.data is undefined or empty
  const columns = (response.data?.map((item) => {
    const column = item.attributes ?? item;
    // Ensure links is always an array, even if not populated
    if (column && !column.links) {
      column.links = [];
    }
    
    // Debug in development
    if (process.env.NODE_ENV === 'development') {
      const authorData: any = column.author;
      console.log('Processed column:', {
        title: column.title,
        slug: column.slug,
        linksCount: column.links?.length ?? 0,
        hasAuthor: !!column.author,
        hasAvatar: !!(authorData?.data?.attributes?.avatar || authorData?.attributes?.avatar || authorData?.avatar),
      });
    }
    
    return column;
  }) ?? []) as Column[];

  return columns;
}

export async function getPublishedRubricaLinks(limit = 100) {
  const columns = await getColumns();

  // Debug in development
  if (process.env.NODE_ENV === 'development') {
    console.log('getPublishedRubricaLinks - columns loaded:', columns.length);
    columns.forEach(column => {
      console.log(`Column "${column.title}": ${column.links?.length || 0} links`);
    });
  }

  // Extract all published links from all columns
  const allLinks = columns
    .flatMap(column => (column.links || []).map((link: any) => ({
      ...link,
      column,
      author: column.author,
      publishDate: link.publishDate ? new Date(link.publishDate) : null
    })));

  // Debug: check all links before filtering
  if (process.env.NODE_ENV === 'development') {
    console.log('getPublishedRubricaLinks - all links before filtering:', allLinks.length);
    allLinks.forEach((link, i) => {
      console.log(`Link ${i}: "${link.label}" - publishDate: ${link.publishDate} - valid: ${!link.publishDate || link.publishDate <= new Date()}`);
    });
  }

  const filteredLinks = allLinks
    .filter((link: any) => {
      // Must have label and url
      if (!link.label || !link.url) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Filtering out link without label or url:', link);
        }
        return false;
      }
      // Must be published (no date or date <= today)
      return !link.publishDate || link.publishDate <= new Date();
    })
    .sort((a, b) => {
      // Sort by publish date (newest first), null dates go to the end
      if (!a.publishDate && !b.publishDate) return 0;
      if (!a.publishDate) return 1;
      if (!b.publishDate) return -1;
      return b.publishDate.getTime() - a.publishDate.getTime();
    })
    .slice(0, limit); // Limit the results

  // Debug: final result
  if (process.env.NODE_ENV === 'development') {
    console.log('getPublishedRubricaLinks - final filtered links:', filteredLinks.length);
    console.log('getPublishedRubricaLinks - requested limit:', limit);
  }

  return filteredLinks;
}

// Get latest rubrica links for homepage
export async function getLatestRubricaLinks(limit = 5) {
  return getPublishedRubricaLinks(limit);
}

// Get recently updated columns (columns with recent links)
export async function getRecentlyUpdatedColumns(limit = 3) {
  const columns = await getColumns();
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Filter columns that have links published in the last 7 days
  const recentlyUpdated = columns
    .map(column => {
      const recentLinks = (column.links || []).filter((link: any) => {
        if (!link.publishDate) return false;
        const linkDate = new Date(link.publishDate);
        return linkDate <= now && linkDate >= sevenDaysAgo;
      });

      return {
        column,
        latestLinkDate: recentLinks.length > 0
          ? Math.max(...recentLinks.map((link: any) => new Date(link.publishDate).getTime()))
          : null,
        recentLinksCount: recentLinks.length
      };
    })
    .filter(item => item.latestLinkDate !== null)
    .sort((a, b) => {
      if (!a.latestLinkDate && !b.latestLinkDate) return 0;
      if (!a.latestLinkDate) return 1;
      if (!b.latestLinkDate) return -1;
      return b.latestLinkDate - a.latestLinkDate;
    })
    .slice(0, limit)
    .map(item => item.column);

  return recentlyUpdated;
}

// Search function
export async function searchContent(query: string, page = 1, pageSize = 12) {
  if (!query || query.trim().length === 0) {
    return {
      videos: [],
      podcasts: [],
      newsletters: [],
      articles: [],
      columns: [],
      rubricaLinks: [],
      pagination: {
        page: 1,
        pageSize,
        pageCount: 1,
        total: 0,
      },
    };
  }

  const searchQuery = query.trim();

  // Get published rubrica links for local filtering
  const [publishedRubricaLinks, videosRes, podcastsRes, newslettersRes, articlesRes, columnsRes] = await Promise.all([
    getPublishedRubricaLinks(1000), // Get many links for search
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
        revalidate: 300, // Search: cache 5 minuti invece di 1 minuto
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
        revalidate: 300, // Search: cache 5 minuti invece di 1 minuto
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
        revalidate: 300, // Search: cache 5 minuti invece di 1 minuto
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
        revalidate: 300, // Search: cache 5 minuti invece di 1 minuto
      },
    ),
    strapiFetch<StrapiPaginatedResponse<Column>>(
      "/api/columns",
      {
        query: {
          populate: "*",
          "publicationState": "live",
          "filters[$or][0][title][$containsi]": searchQuery,
          "filters[$or][1][description][$containsi]": searchQuery,
          "pagination[page]": page,
          "pagination[pageSize]": pageSize,
        },
        revalidate: 300, // Search: cache 5 minuti invece di 1 minuto
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

  const columns = (columnsRes.data?.map((item) => {
    if (item.attributes) return item.attributes;
    return item;
  }) ?? []) as Column[];

  // Filter published rubrica links by search query
  const rubricaLinks = publishedRubricaLinks.filter(link =>
    link.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.column?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply pagination to rubrica links
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRubricaLinks = rubricaLinks.slice(startIndex, endIndex);

  const total = (videosRes.meta?.pagination?.total ?? 0) +
    (podcastsRes.meta?.pagination?.total ?? 0) +
    (newslettersRes.meta?.pagination?.total ?? 0) +
    (articlesRes.meta?.pagination?.total ?? 0) +
    (columnsRes.meta?.pagination?.total ?? 0) +
    rubricaLinks.length;

  return {
    videos,
    podcasts,
    newsletters,
    articles,
    columns,
    rubricaLinks: paginatedRubricaLinks,
    pagination: {
      page,
      pageSize,
      pageCount: Math.max(
        videosRes.meta?.pagination?.pageCount ?? 1,
        podcastsRes.meta?.pagination?.pageCount ?? 1,
        newslettersRes.meta?.pagination?.pageCount ?? 1,
        articlesRes.meta?.pagination?.pageCount ?? 1,
        columnsRes.meta?.pagination?.pageCount ?? 1,
        Math.ceil(rubricaLinks.length / pageSize),
      ),
      total,
    },
  };
}

// Petitions
export async function getLatestPetitions(limit = 6) {
  const now = new Date().toISOString();
  const response = await strapiFetch<StrapiCollectionResponse<Petition>>(
    "/api/petitions",
    {
      query: {
        "populate[0]": "author",
        "populate[1]": "author.avatar",
        "populate[2]": "heroImage",
        "populate[3]": "tags",
        "publicationState": "live",
        "filters[publishDate][$lte]": now,
        "filters[isActive][$eq]": true,
        "pagination[pageSize]": limit,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 300, // Petizioni: cache 5 minuti
    },
  );

  return (response.data?.map((item) => {
    if (item.attributes) {
      return item.attributes;
    }
    return item;
  }) ?? []) as Petition[];
}

export async function getPetitions(page = 1, pageSize = 12) {
  const now = new Date().toISOString();
  const response = await strapiFetch<StrapiPaginatedResponse<Petition>>(
    "/api/petitions",
    {
      query: {
        "populate[0]": "author",
        "populate[1]": "author.avatar",
        "populate[2]": "heroImage",
        "populate[3]": "tags",
        "publicationState": "live",
        "filters[publishDate][$lte]": now,
        "filters[isActive][$eq]": true,
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 300, // Lista petizioni paginata: cache 5 minuti
    },
  );

  const petitions = (response.data?.map((item) => {
    if (item.attributes) {
      return item.attributes;
    }
    return item;
  }) ?? []) as Petition[];

  return {
    data: petitions,
    pagination: response.meta?.pagination ?? {
      page: 1,
      pageSize,
      pageCount: 1,
      total: petitions.length,
    },
  };
}

export async function getPetitionBySlug(slug: string) {
  const response = await strapiFetch<StrapiCollectionResponse<Petition>>(
    "/api/petitions",
    {
      query: {
        "populate[0]": "author",
        "populate[1]": "author.avatar",
        "populate[2]": "heroImage",
        "populate[3]": "tags",
        "populate[4]": "seo",
        "populate[5]": "seo.metaImage",
        "publicationState": "live",
        "filters[slug][$eq]": slug,
      },
      revalidate: 3600, // Singole petizioni: cache 1 ora
    },
  );

  const petition = response.data?.[0];
  return petition?.attributes ?? petition ?? null;
}

// ─── Events ────────────────────────────────────────────

export async function getEvents(page = 1, pageSize = 12) {
  const response = await strapiFetch<StrapiPaginatedResponse<Event>>(
    "/api/events",
    {
      query: {
        "populate[0]": "heroImage",
        "populate[1]": "tags",
        "publicationState": "live",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "sort[0]": "startDate:asc",
      },
      revalidate: 300,
    },
  );

  const events = (response.data?.map((item) => {
    if (item.attributes) {
      return item.attributes;
    }
    return item;
  }) ?? []) as Event[];

  return {
    data: events,
    pagination: response.meta?.pagination ?? {
      page: 1,
      pageSize,
      pageCount: 1,
      total: events.length,
    },
  };
}

export async function getUpcomingEvents(limit = 6) {
  const now = new Date().toISOString();
  const response = await strapiFetch<StrapiPaginatedResponse<Event>>(
    "/api/events",
    {
      query: {
        "populate[0]": "heroImage",
        "populate[1]": "tags",
        "publicationState": "live",
        "filters[startDate][$gte]": now,
        "pagination[page]": 1,
        "pagination[pageSize]": limit,
        "sort[0]": "startDate:asc",
      },
      revalidate: 300,
    },
  );

  return (response.data?.map((item) => {
    if (item.attributes) {
      return item.attributes;
    }
    return item;
  }) ?? []) as Event[];
}

export async function getEventsByMonth(year: number, month: number) {
  // month è 0-indexed (0 = gennaio, 11 = dicembre) per coerenza con JS Date
  const startOfMonth = new Date(year, month, 1).toISOString();
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const response = await strapiFetch<StrapiPaginatedResponse<Event>>(
    "/api/events",
    {
      query: {
        "populate[0]": "heroImage",
        "populate[1]": "tags",
        "publicationState": "live",
        "filters[$or][0][startDate][$gte]": startOfMonth,
        "filters[$or][0][startDate][$lte]": endOfMonth,
        "filters[$or][1][endDate][$gte]": startOfMonth,
        "filters[$or][1][endDate][$lte]": endOfMonth,
        "pagination[pageSize]": 100,
        "sort[0]": "startDate:asc",
      },
      revalidate: 300,
    },
  );

  return (response.data?.map((item) => {
    if (item.attributes) {
      return item.attributes;
    }
    return item;
  }) ?? []) as Event[];
}

export async function getEventBySlug(slug: string) {
  const response = await strapiFetch<StrapiCollectionResponse<Event>>(
    "/api/events",
    {
      query: {
        "populate[0]": "heroImage",
        "populate[1]": "tags",
        "populate[2]": "seo",
        "populate[3]": "seo.metaImage",
        "publicationState": "live",
        "filters[slug][$eq]": slug,
      },
      revalidate: 3600,
    },
  );

  const event = response.data?.[0];
  return event?.attributes ?? event ?? null;
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
  Petition,
  Event,
  StrapiCollectionResponse,
  PaginationMeta,
};

// Function to extract metadata from external URLs
export async function extractExternalMetadata(url: string): Promise<{
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}> {
  try {
    // For security, we'll use a simple approach that doesn't execute JavaScript
    // In production, you might want to use a service like Microlink or similar
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CapibaraBot/1.0)',
      },
      // Timeout after 5 seconds
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const metadata: any = {};

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }

    // Extract meta tags
    const metaRegex = /<meta[^>]+(?:name|property)=["']([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
    let metaMatch;

    while ((metaMatch = metaRegex.exec(html)) !== null) {
      const name = metaMatch[1].toLowerCase();
      const content = metaMatch[2];

      switch (name) {
        case 'description':
          metadata.description = content;
          break;
        case 'og:title':
          metadata.title = content;
          break;
        case 'og:description':
          metadata.description = content;
          break;
        case 'og:image':
          metadata.image = content.startsWith('http') ? content : new URL(content, url).href;
          break;
        case 'og:site_name':
          metadata.siteName = content;
          break;
      }
    }

    return metadata;
  } catch (error) {
    console.warn(`Failed to extract metadata from ${url}:`, error);
    return {};
  }
}

// ─── Courses & Lessons ───────────────────────────────────────────────

type QuizQuestion = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC?: string | null;
  optionD?: string | null;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation?: string | null;
};

export type Course = {
  title: string;
  slug: string;
  description?: string | null;
  body?: string | null;
  level: "base" | "intermedio" | "avanzato";
  category: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  estimatedHours?: number | null;
  publishDate?: string | null;
  heroImage?: {
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
  } | null;
  lessons?: {
    data: Array<{
      id: number;
      attributes: Lesson;
    }>;
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

export type Lesson = {
  title: string;
  slug: string;
  body?: string | null;
  videoUrl?: string | null;
  order: number;
  durationMinutes?: number | null;
  isFree?: boolean;
  course?: {
    data: {
      attributes: Pick<Course, "title" | "slug">;
    } | null;
  };
  quiz?: QuizQuestion[] | null;
};

export { type QuizQuestion };

export async function getCourses(page = 1, pageSize = 12) {
  const response = await strapiFetch<StrapiPaginatedResponse<Course>>(
    "/api/courses",
    {
      query: {
        "populate[0]": "heroImage",
        "populate[1]": "author",
        "populate[2]": "author.avatar",
        "populate[3]": "tags",
        "populate[4]": "lessons",
        "publicationState": "live",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 300,
    },
  );

  const courses = (response.data?.map((item) => {
    if (item.attributes) return item.attributes;
    return item;
  }) ?? []) as Course[];

  return {
    data: courses,
    pagination: response.meta?.pagination ?? {
      page: 1,
      pageSize,
      pageCount: 1,
      total: courses.length,
    },
  };
}

export async function getLatestCourses(limit = 6) {
  const response = await strapiFetch<StrapiCollectionResponse<Course>>(
    "/api/courses",
    {
      query: {
        "populate[0]": "heroImage",
        "populate[1]": "author",
        "populate[2]": "author.avatar",
        "populate[3]": "tags",
        "populate[4]": "lessons",
        "publicationState": "live",
        "pagination[pageSize]": limit,
        "sort[0]": "publishDate:desc",
      },
      revalidate: 300,
    },
  );

  return (response.data?.map((item) => {
    if (item.attributes) return item.attributes;
    return item;
  }) ?? []) as Course[];
}

export async function getCourseBySlug(slug: string) {
  const response = await strapiFetch<StrapiCollectionResponse<Course>>(
    "/api/courses",
    {
      query: {
        "populate[0]": "heroImage",
        "populate[1]": "author",
        "populate[2]": "author.avatar",
        "populate[3]": "tags",
        "populate[4]": "lessons",
        "populate[5]": "lessons.quiz",
        "populate[6]": "seo",
        "populate[7]": "seo.metaImage",
        "publicationState": "live",
        "filters[slug][$eq]": slug,
      },
      revalidate: 3600,
    },
  );

  const course = response.data?.[0];
  return course?.attributes ?? course ?? null;
}

export async function getLessonBySlug(courseSlug: string, lessonSlug: string) {
  const response = await strapiFetch<StrapiCollectionResponse<Lesson>>(
    "/api/lessons",
    {
      query: {
        "populate[0]": "course",
        "populate[1]": "quiz",
        "publicationState": "live",
        "filters[slug][$eq]": lessonSlug,
        "filters[course][slug][$eq]": courseSlug,
      },
      revalidate: 3600,
    },
  );

  const lesson = response.data?.[0];
  return lesson?.attributes ?? lesson ?? null;
}

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
      revalidate: 3600, // Authors cambiano molto raramente, cache 1 ora
    },
  );

  return (response.data?.map((item) => {
    if (item.attributes) return item.attributes;
    return item;
  }) ?? []) as Author[];
}

