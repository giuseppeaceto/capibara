import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { FileText, Columns, Clock, CheckCircle2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ContentItem {
  id: number;
  attributes: {
    title: string;
    slug: string;
    updatedAt: string;
    publishedAt: string | null;
  };
}

export default function DashboardPage() {
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['articles', 'recent'],
    queryFn: () =>
      apiClient.find<ContentItem>('articles', {
        sort: ['updatedAt:desc'],
        pagination: { limit: 10 },
        populate: '*',
      }),
  });

  const { data: columns, isLoading: columnsLoading } = useQuery({
    queryKey: ['columns', 'recent'],
    queryFn: () =>
      apiClient.find<ContentItem>('columns', {
        sort: ['updatedAt:desc'],
        pagination: { limit: 10 },
        populate: '*',
      }),
  });

  const isLoading = articlesLoading || columnsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Gestisci i tuoi contenuti e crea nuovi articoli o colonne
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FileText size={20} />
              <span>Articoli Recenti</span>
            </h2>
            <Link
              to="/articles/new"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Nuovo →
            </Link>
          </div>

          {articles?.data && articles.data.length > 0 ? (
            <div className="space-y-3">
              {articles.data.map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.id}/edit`}
                  className="block p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {article.attributes.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {format(
                            new Date(article.attributes.updatedAt),
                            'dd MMM yyyy, HH:mm',
                            { locale: it }
                          )}
                        </span>
                        {article.attributes.publishedAt ? (
                          <CheckCircle2
                            size={14}
                            className="text-green-600"
                            title="Pubblicato"
                          />
                        ) : (
                          <Clock
                            size={14}
                            className="text-gray-400"
                            title="Draft"
                          />
                        )}
                      </div>
                    </div>
                    <Edit
                      size={16}
                      className="text-gray-400 ml-2 flex-shrink-0"
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Nessun articolo ancora. Crea il primo!
            </p>
          )}
        </div>

        {/* Recent Columns */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Columns size={20} />
              <span>Colonne Recenti</span>
            </h2>
            <Link
              to="/columns/new"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Nuovo →
            </Link>
          </div>

          {columns?.data && columns.data.length > 0 ? (
            <div className="space-y-3">
              {columns.data.map((column) => (
                <Link
                  key={column.id}
                  to={`/columns/${column.id}/edit`}
                  className="block p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {column.attributes.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {format(
                            new Date(column.attributes.updatedAt),
                            'dd MMM yyyy, HH:mm',
                            { locale: it }
                          )}
                        </span>
                        {column.attributes.publishedAt ? (
                          <CheckCircle2
                            size={14}
                            className="text-green-600"
                            title="Pubblicato"
                          />
                        ) : (
                          <Clock
                            size={14}
                            className="text-gray-400"
                            title="Draft"
                          />
                        )}
                      </div>
                    </div>
                    <Edit
                      size={16}
                      className="text-gray-400 ml-2 flex-shrink-0"
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Nessuna colonna ancora. Crea la prima!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
