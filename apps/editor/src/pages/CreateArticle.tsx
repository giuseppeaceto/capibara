import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import ArticleForm from '../components/forms/ArticleForm';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function CreateArticlePage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

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
      }

      if (formData.author) {
        data.author = formData.author;
      }

      if (formData.tags.length > 0) {
        data.tags = formData.tags;
      }

      if (formData.partners.length > 0) {
        data.partners = formData.partners;
      }

      if (formData.seo) {
        const seoData: Record<string, unknown> = {};
        if (formData.seo.metaTitle) seoData.metaTitle = formData.seo.metaTitle;
        if (formData.seo.metaDescription) seoData.metaDescription = formData.seo.metaDescription;
        if (formData.seo.keywords) seoData.keywords = formData.seo.keywords;
        if (formData.seo.metaImage) {
          seoData.metaImage = formData.seo.metaImage.id;
        }
        if (formData.seo.preventIndexing !== undefined) {
          seoData.preventIndexing = formData.seo.preventIndexing;
        }
        if (Object.keys(seoData).length > 0) {
          data.seo = seoData;
        }
      }

      return apiClient.create('articles', data);
    },
    onSuccess: () => {
      navigate('/');
    },
    onError: (err: unknown) => {
      setError(
        err instanceof Error
          ? err.message
          : 'Errore durante la creazione. Riprova.'
      );
    },
  });

  const handleSubmit = async (data: unknown) => {
    setError('');
    await mutation.mutateAsync(data);
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Nuovo Articolo</h1>
        <p className="text-gray-600 mt-1">
          Crea un nuovo articolo editoriale
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
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  );
}
