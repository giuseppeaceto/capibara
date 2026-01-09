import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import ColumnForm from '../components/forms/ColumnForm';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function EditColumnPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['columns', id],
    queryFn: () =>
      apiClient.findOne('columns', id!, {
        populate: ['cover', 'author', 'links'],
      }),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (formData: {
      title: string;
      slug: string;
      description: string;
      cover: { id: number; url: string } | null;
      author: number | null;
      links: Array<{ label: string; url: string; description?: string; publishDate?: string }>;
    }) => {
      // Format data for Strapi API
      const data: Record<string, unknown> = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        links: formData.links.map((link) => ({
          label: link.label,
          url: link.url,
          description: link.description || null,
          publishDate: link.publishDate || null,
        })),
      };

      if (formData.cover) {
        data.cover = formData.cover.id;
      } else {
        data.cover = null;
      }

      if (formData.author) {
        data.author = formData.author;
      } else {
        data.author = null;
      }

      return apiClient.update('columns', id!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
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
      <div className="max-w-3xl mx-auto">
        <div className="card text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Rubrica non trovata
          </h2>
          <p className="text-gray-600 mb-4">
            La rubrica che stai cercando non esiste o è stata eliminata.
          </p>
          <Link to="/" className="btn-primary inline-block">
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} />
          <span>Torna alla Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifica Rubrica</h1>
        <p className="text-gray-600 mt-1">
          Modifica i dettagli della rubrica
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="card">
        <ColumnForm
          initialData={data.data}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  );
}
