import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import ArticleForm from '../components/forms/ArticleForm';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['articles', id],
    queryFn: () =>
      apiClient.findOne('articles', id!, {
        populate: ['heroImage', 'author', 'tags', 'partners', 'seo.metaImage'],
      }),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (formData: {
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
      seo: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string;
        metaImage?: { id: number; url: string } | null;
        preventIndexing?: boolean;
      } | null;
    }) => {
      // Format data for Strapi API
      const data: Record<string, unknown> = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        body: formData.body,
        publishDate: formData.publishDate || null,
        isPremium: formData.isPremium,
        readingTime: formData.readingTime || null,
      };

      if (formData.heroImage) {
        data.heroImage = formData.heroImage.id;
      } else {
        data.heroImage = null;
      }

      if (formData.author) {
        data.author = formData.author;
      } else {
        data.author = null;
      }

      data.tags = formData.tags.length > 0 ? formData.tags : [];
      data.partners = formData.partners.length > 0 ? formData.partners : [];

      if (formData.seo) {
        const seoData: Record<string, unknown> = {};
        if (formData.seo.metaTitle) seoData.metaTitle = formData.seo.metaTitle;
        if (formData.seo.metaDescription) seoData.metaDescription = formData.seo.metaDescription;
        if (formData.seo.keywords) seoData.keywords = formData.seo.keywords;
        if (formData.seo.metaImage) {
          seoData.metaImage = formData.seo.metaImage.id;
        } else {
          seoData.metaImage = null;
        }
        if (formData.seo.preventIndexing !== undefined) {
          seoData.preventIndexing = formData.seo.preventIndexing;
        }
        data.seo = seoData;
      } else {
        data.seo = null;
      }

      return apiClient.update('articles', id!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      navigate('/');
    },
    onError: (err: unknown) => {
      setError(
        err instanceof Error
          ? err.message
          : 'Errore durante il salvataggio. Riprova.'
      );
    },
  });

  const handleSubmit = async (data: unknown) => {
    setError('');
    await mutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Articolo non trovato
          </h2>
          <p className="text-gray-600 mb-4">
            L'articolo che stai cercando non esiste o è stato eliminato.
          </p>
          <Link to="/" className="btn-primary inline-block">
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} />
          <span>Torna alla Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifica Articolo</h1>
        <p className="text-gray-600 mt-1">
          Modifica i dettagli dell'articolo
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="card">
        <ArticleForm
          initialData={data.data}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  );
}
