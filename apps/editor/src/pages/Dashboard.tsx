import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { FileText, Columns, Clock, CheckCircle2, Edit, Link as LinkIcon, Plus } from 'lucide-react';
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FileText size={20} />
              <span>Articoli</span>
            </h2>
            <Link
              to="/articles/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={16} />
              <span>Nuovo</span>
            </Link>
          </div>

          {articles?.data && articles.data.length > 0 ? (
            <div className="space-y-3">
              {articles.data
                .filter((article) => article?.attributes?.title)
                .map((article) => (
                  <Link
                    key={article.id}
                    to={`/articles/${article.id}/edit`}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {article.attributes.title || 'Senza titolo'}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {article.attributes.updatedAt && (
                            <span className="text-xs text-gray-500">
                              {format(
                                new Date(article.attributes.updatedAt),
                                'dd MMM yyyy, HH:mm',
                                { locale: it }
                              )}
                            </span>
                          )}
                          {article.attributes.publishedAt ? (
                            <span title="Pubblicato">
                              <CheckCircle2
                                size={14}
                                className="text-green-600"
                              />
                            </span>
                          ) : (
                            <span title="Draft">
                              <Clock
                                size={14}
                                className="text-gray-400"
                              />
                            </span>
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
              <span>Rubriche</span>
            </h2>
            <Link
              to="/columns/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={16} />
              <span>Nuovo</span>
            </Link>
          </div>

          {columns?.data && columns.data.length > 0 ? (
            <div className="space-y-3">
              {columns.data
                .filter((column) => column?.attributes?.title)
                .map((column) => (
                  <div
                    key={column.id}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <Link
                        to={`/columns/${column.id}/edit`}
                        className="flex-1 min-w-0"
                      >
                        <h3 className="font-medium text-gray-900 truncate">
                          {column.attributes.title || 'Senza titolo'}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {column.attributes.updatedAt && (
                            <span className="text-xs text-gray-500">
                              {format(
                                new Date(column.attributes.updatedAt),
                                'dd MMM yyyy, HH:mm',
                                { locale: it }
                              )}
                            </span>
                          )}
                          {column.attributes.publishedAt ? (
                            <span title="Pubblicato">
                              <CheckCircle2
                                size={14}
                                className="text-green-600"
                              />
                            </span>
                          ) : (
                            <span title="Draft">
                              <Clock
                                size={14}
                                className="text-gray-400"
                              />
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <Link
                          to={`/columns/${column.id}/links`}
                          className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                          title="Gestisci link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon size={16} />
                        </Link>
                        <Link
                          to={`/columns/${column.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="Modifica rubrica"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Nessuna rubrica ancora. Crea la prima!
            </p>
          )}
        </div>

        {/* Newsroom */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <LinkIcon size={20} />
              <span>Newsroom</span>
            </h2>
            <Link
              to="/columns/select-links"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={16} />
              <span>Nuovo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
