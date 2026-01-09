import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import ImageUpload from '../ui/ImageUpload';
import Select from '../ui/Select';
import { Plus, X, Loader2 } from 'lucide-react';

interface LinkItem {
  label: string;
  url: string;
  description?: string;
  publishDate?: string;
}

interface ColumnFormData {
  title: string;
  slug: string;
  description: string;
  cover: { id: number; url: string } | null;
  author: number | null;
  links: LinkItem[];
}

interface ColumnFormProps {
  initialData?: {
    id: number;
    attributes: Partial<ColumnFormData & { author?: { data?: { id: number } } }>;
  };
  onSubmit: (data: ColumnFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ColumnForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: ColumnFormProps) {
  const [formData, setFormData] = useState<ColumnFormData>({
    title: '',
    slug: '',
    description: '',
    cover: null,
    author: null,
    links: [],
  });

  // Load authors
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

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      const attrs = initialData.attributes;
      setFormData({
        title: attrs.title || '',
        slug: attrs.slug || '',
        description: attrs.description || '',
        cover:
          attrs.cover?.data && typeof attrs.cover.data === 'object'
            ? {
                id: 'id' in attrs.cover.data ? attrs.cover.data.id : 0,
                url:
                  'attributes' in attrs.cover.data &&
                  attrs.cover.data.attributes &&
                  typeof attrs.cover.data.attributes === 'object' &&
                  'url' in attrs.cover.data.attributes &&
                  typeof attrs.cover.data.attributes.url === 'string'
                    ? attrs.cover.data.attributes.url.startsWith('http')
                      ? attrs.cover.data.attributes.url
                      : `${import.meta.env.VITE_STRAPI_URL}${attrs.cover.data.attributes.url}`
                    : '',
              }
            : null,
        author: attrs.author?.data?.id || null,
        links: (attrs.links || []) as LinkItem[],
      });
    }
  }, [initialData]);

  // Auto-generate slug from title
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

  const handleAddLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, { label: '', url: '', description: '' }],
    }));
  };

  const handleRemoveLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const handleLinkChange = (
    index: number,
    field: keyof LinkItem,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
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
          placeholder="Titolo della colonna"
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
          placeholder="slug-della-colonna"
        />
        <p className="mt-1 text-xs text-gray-500">
          URL-friendly identifier (auto-generato dal titolo)
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="label">
          Descrizione
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="input"
          rows={4}
          placeholder="Descrizione della colonna..."
        />
      </div>

      {/* Cover Image */}
      <ImageUpload
        label="Immagine di copertina"
        value={formData.cover}
        onChange={(cover) => setFormData((prev) => ({ ...prev, cover }))}
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

      {/* Links */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label">Link</label>
          <button
            type="button"
            onClick={handleAddLink}
            className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus size={16} />
            <span>Aggiungi Link</span>
          </button>
        </div>

        {formData.links.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
            Nessun link aggiunto. Clicca "Aggiungi Link" per iniziare.
          </p>
        ) : (
          <div className="space-y-4">
            {formData.links.map((link, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Link #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <label className="label text-xs">Label *</label>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) =>
                      handleLinkChange(index, 'label', e.target.value)
                    }
                    className="input text-sm"
                    required
                    placeholder="Testo del link"
                  />
                </div>

                <div>
                  <label className="label text-xs">URL *</label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      handleLinkChange(index, 'url', e.target.value)
                    }
                    className="input text-sm font-mono"
                    required
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="label text-xs">Descrizione</label>
                  <textarea
                    value={link.description || ''}
                    onChange={(e) =>
                      handleLinkChange(index, 'description', e.target.value)
                    }
                    className="input text-sm"
                    rows={2}
                    placeholder="Descrizione opzionale..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
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
