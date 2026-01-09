import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import ImageUpload from '../ui/ImageUpload';
import Select from '../ui/Select';
import MultiSelect from '../ui/MultiSelect';
import RichTextEditor from '../editors/RichTextEditor';
import { Loader2 } from 'lucide-react';

interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  metaImage?: { id: number; url: string } | null;
  preventIndexing?: boolean;
}

interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  heroImage: { id: number; url: string } | null;
  publishDate: string;
  isPremium: boolean;
  readingTime: number | null;
  author: number | null;
  tags: number[];
  partners: number[];
  seo: SEOData | null;
}

interface ArticleFormProps {
  initialData?: {
    id: number;
    attributes: Partial<
      ArticleFormData & {
        author?: { data?: { id: number } };
        tags?: { data?: Array<{ id: number }> };
        partners?: { data?: Array<{ id: number }> };
        heroImage?: { data?: { id: number; attributes?: { url?: string } } };
        seo?: SEOData & {
          metaImage?: { data?: { id: number; attributes?: { url?: string } } };
        };
      }
    >;
  };
  onSubmit: (data: ArticleFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ArticleForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: ArticleFormProps) {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    heroImage: null,
    publishDate: new Date().toISOString().slice(0, 16),
    isPremium: false,
    readingTime: null,
    author: null,
    tags: [],
    partners: [],
    seo: null,
  });

  // Load authors, tags, partners
  const { data: authorsData, error: authorsError } = useQuery({
    queryKey: ['authors'],
    queryFn: () =>
      apiClient.find<{ id: number; attributes: { name: string } }>('authors', {
        pagination: { limit: 100 },
        publicationState: 'preview', // Include draft content
        sort: ['name:asc'],
      }),
  });

  // Debug: log authors data
  useEffect(() => {
    if (authorsError) {
      console.error('Error loading authors:', authorsError);
    }
    if (authorsData) {
      console.log('Authors data:', authorsData);
    }
  }, [authorsData, authorsError]);

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () =>
      apiClient.find<{ id: number; attributes: { name: string } }>('tags', {
        pagination: { limit: 200 },
      }),
  });

  const { data: partnersData } = useQuery({
    queryKey: ['partners'],
    queryFn: () =>
      apiClient.find<{ id: number; attributes: { name: string } }>('partners', {
        pagination: { limit: 100 },
      }),
  });

  // Initialize form
  useEffect(() => {
    if (initialData) {
      const attrs = initialData.attributes;
      const getImageUrl = (img: unknown) => {
        if (
          typeof img === 'object' &&
          img !== null &&
          'data' in img &&
          img.data &&
          typeof img.data === 'object' &&
          'attributes' in img.data &&
          img.data.attributes &&
          typeof img.data.attributes === 'object' &&
          'url' in img.data.attributes
        ) {
          const url = img.data.attributes.url;
          return typeof url === 'string'
            ? url.startsWith('http')
              ? url
              : `${import.meta.env.VITE_STRAPI_URL}${url}`
            : '';
        }
        return '';
      };

      setFormData({
        title: attrs.title || '',
        slug: attrs.slug || '',
        excerpt: attrs.excerpt || '',
        body: attrs.body || '',
        heroImage:
          attrs.heroImage?.data?.id && getImageUrl(attrs.heroImage)
            ? { id: attrs.heroImage.data.id, url: getImageUrl(attrs.heroImage) }
            : null,
        publishDate: attrs.publishDate
          ? new Date(attrs.publishDate).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        isPremium: attrs.isPremium || false,
        readingTime: attrs.readingTime || null,
        author: attrs.author?.data?.id || null,
        tags: attrs.tags?.data?.map((t) => t.id) || [],
        partners: attrs.partners?.data?.map((p) => p.id) || [],
        seo: attrs.seo || null,
      });
    }
  }, [initialData]);

  // Auto-generate slug
  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug:
        prev.slug === '' || prev.slug === prev.title.toLowerCase().replace(/\s+/g, '-')
          ? title
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')
          : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const authorOptions =
    authorsData?.data.map((author) => ({
      value: author.id,
      label: author.attributes.name || `Author #${author.id}`,
    })) || [];

  const tagOptions =
    tagsData?.data.map((tag) => ({
      id: tag.id,
      label: tag.attributes.name,
    })) || [];

  const partnerOptions =
    partnersData?.data.map((partner) => ({
      id: partner.id,
      label: partner.attributes.name,
    })) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="label">
          Titolo <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="input"
          required
          placeholder="Titolo dell'articolo"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="label">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          id="slug"
          type="text"
          value={formData.slug}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              slug: e.target.value
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, ''),
            }))
          }
          className="input font-mono text-sm"
          required
          placeholder="slug-dell-articolo"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="label">
          Estratto
        </label>
        <textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
          }
          className="input"
          rows={3}
          placeholder="Breve descrizione dell'articolo..."
          maxLength={300}
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.excerpt.length}/300 caratteri
        </p>
      </div>

      {/* Body */}
      <RichTextEditor
        label="Contenuto"
        value={formData.body}
        onChange={(body) => setFormData((prev) => ({ ...prev, body }))}
        placeholder="Inizia a scrivere il contenuto dell'articolo..."
      />

      {/* Hero Image */}
      <ImageUpload
        label="Immagine Hero"
        value={formData.heroImage}
        onChange={(heroImage) =>
          setFormData((prev) => ({ ...prev, heroImage }))
        }
      />

      {/* Author */}
      <Select
        label="Autore"
        value={formData.author}
        onChange={(author) =>
          setFormData((prev) => ({ ...prev, author: author as number }))
        }
        options={authorOptions}
        placeholder="Seleziona un autore..."
      />

      {/* Tags */}
      <MultiSelect
        label="Tag"
        value={formData.tags}
        onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
        options={tagOptions}
        placeholder="Seleziona tag..."
      />

      {/* Partners */}
      <MultiSelect
        label="Partner"
        value={formData.partners}
        onChange={(partners) =>
          setFormData((prev) => ({ ...prev, partners }))
        }
        options={partnerOptions}
        placeholder="Seleziona partner..."
      />

      {/* Publish Date */}
      <div>
        <label htmlFor="publishDate" className="label">
          Data di pubblicazione
        </label>
        <input
          id="publishDate"
          type="datetime-local"
          value={formData.publishDate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, publishDate: e.target.value }))
          }
          className="input"
        />
      </div>

      {/* Premium & Reading Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isPremium}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isPremium: e.target.checked }))
              }
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="label mb-0">Contenuto Premium</span>
          </label>
        </div>

        <div>
          <label htmlFor="readingTime" className="label">
            Tempo di lettura (minuti)
          </label>
          <input
            id="readingTime"
            type="number"
            min="1"
            value={formData.readingTime || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                readingTime: e.target.value ? parseInt(e.target.value) : null,
              }))
            }
            className="input"
            placeholder="es. 5"
          />
        </div>
      </div>

      {/* SEO Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="seoMetaTitle" className="label">
              Meta Title
            </label>
            <input
              id="seoMetaTitle"
              type="text"
              value={formData.seo?.metaTitle || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: {
                    ...prev.seo,
                    metaTitle: e.target.value,
                  },
                }))
              }
              className="input"
              maxLength={60}
              placeholder="Titolo per i motori di ricerca (max 60 caratteri)"
            />
            <p className="mt-1 text-xs text-gray-500">
              {(formData.seo?.metaTitle || '').length}/60 caratteri
            </p>
          </div>

          <div>
            <label htmlFor="seoMetaDescription" className="label">
              Meta Description
            </label>
            <textarea
              id="seoMetaDescription"
              value={formData.seo?.metaDescription || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: {
                    ...prev.seo,
                    metaDescription: e.target.value,
                  },
                }))
              }
              className="input"
              rows={3}
              maxLength={160}
              placeholder="Descrizione per i motori di ricerca (max 160 caratteri)"
            />
            <p className="mt-1 text-xs text-gray-500">
              {(formData.seo?.metaDescription || '').length}/160 caratteri
            </p>
          </div>

          <div>
            <label htmlFor="seoKeywords" className="label">
              Keywords
            </label>
            <input
              id="seoKeywords"
              type="text"
              value={formData.seo?.keywords || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: {
                    ...prev.seo,
                    keywords: e.target.value,
                  },
                }))
              }
              className="input"
              placeholder="parola1, parola2, parola3"
            />
          </div>

          <ImageUpload
            label="Meta Image (per social sharing)"
            value={formData.seo?.metaImage || null}
            onChange={(metaImage) =>
              setFormData((prev) => ({
                ...prev,
                seo: {
                  ...prev.seo,
                  metaImage,
                },
              }))
            }
          />

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.seo?.preventIndexing || false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seo: {
                      ...prev.seo,
                      preventIndexing: e.target.checked,
                    },
                  }))
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="label mb-0">
                Impedisci indicizzazione (noindex)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={16} />}
          <span>{isSubmitting ? 'Salvataggio...' : 'Salva'}</span>
        </button>
      </div>
    </form>
  );
}
