import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { ArrowLeft, Columns, Link as LinkIcon } from 'lucide-react';
import Select from '../components/ui/Select';

// Support both Strapi v4 (with attributes) and v5 (direct fields + documentId)
interface ColumnItem {
  id?: number;
  documentId?: string;
  title?: string;
  slug?: string;
  description?: string;
  cover?: any; // Media field - can be various structures
  author?: {
    id?: number;
    name?: string;
    avatar?: any; // Media field - can be various structures
    attributes?: {
      name: string;
      avatar?: any;
    };
  };
  attributes?: {
    title: string;
    slug: string;
    description?: string;
    cover?: any;
    author?: {
      data?: {
        attributes?: {
          name: string;
          avatar?: any;
        };
      };
    };
  };
}

// Helper function to extract cover image URL from various Strapi structures
function extractCoverImage(cover: any): string | null {
  if (!cover) return null;
  
  const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
  
  // Strapi v5: { url, alternativeText, ... }
  if (cover.url) {
    return cover.url.startsWith('http') ? cover.url : `${STRAPI_URL}${cover.url}`;
  }
  
  // Strapi v4: { data: { attributes: { url, alternativeText } } }
  if (cover.data?.attributes?.url) {
    const url = cover.data.attributes.url;
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  }
  
  // Strapi v4/v5: { data: { url, ... } }
  if (cover.data?.url) {
    const url = cover.data.url;
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  }
  
  // Array case: [{ url, ... }] or [{ attributes: { url, ... } }]
  if (Array.isArray(cover) && cover[0]) {
    if (cover[0].url) {
      const url = cover[0].url;
      return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
    }
    if (cover[0].attributes?.url) {
      const url = cover[0].attributes.url;
      return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
    }
  }
  
  // Array with data wrapper: { data: [{ attributes: { url, ... } }] }
  if (Array.isArray(cover.data) && cover.data[0]?.attributes?.url) {
    const url = cover.data[0].attributes.url;
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  }
  
  return null;
}

// Helper function to extract avatar image URL from various Strapi structures
function extractAvatarImage(avatar: any): string | null {
  if (!avatar) return null;
  
  const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
  
  // Strapi v5: { url, alternativeText, ... }
  if (avatar.url) {
    return avatar.url.startsWith('http') ? avatar.url : `${STRAPI_URL}${avatar.url}`;
  }
  
  // Strapi v4: { data: { attributes: { url, alternativeText } } }
  if (avatar.data?.attributes?.url) {
    const url = avatar.data.attributes.url;
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  }
  
  // Strapi v4/v5: { data: { url, ... } }
  if (avatar.data?.url) {
    const url = avatar.data.url;
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  }
  
  return null;
}

export default function SelectColumnForLinksPage() {
  const navigate = useNavigate();

  const { data: columns, isLoading } = useQuery({
    queryKey: ['columns', 'all'],
    queryFn: () =>
      apiClient.find<ColumnItem>('columns', {
        sort: ['title:asc'],
        pagination: { limit: 100 },
        populate: ['author', 'author.avatar', 'cover'],
      }),
  });

  // Debug logging
  console.log('📊 Columns loaded:', columns?.data?.length || 0, 'columns');
  if (columns?.data?.length) {
    console.log('📝 Sample column structure:', columns.data[0]);
  }

  const validColumns =
    columns?.data?.filter((column) => {
      // In Strapi v5, prefer id (numeric) over documentId (string UUID)
      // API REST endpoints expect numeric id, not documentId
      const columnId = typeof column?.id === 'number' ? column.id : (column?.id ?? column?.documentId);
      
      if (!column || !columnId) {
        return false;
      }

      // In Strapi v5, fields are directly on the object, not in attributes
      return true;
    }) || [];

  const columnOptions = validColumns
    .map((column, index) => {
      // Prioritize numeric id over documentId for API compatibility
      // Strapi v5 REST API uses numeric id for findOne/update/delete operations
      const columnId = typeof column?.id === 'number' ? column.id : (column?.id ?? column?.documentId);
      
      // Strapi v5: fields are directly on the object
      // Strapi v4: fields are in attributes
      const title = column?.title ?? column?.attributes?.title;
      
      // Skip if no valid ID
      if (!columnId) {
        return null;
      }
      
      console.log(`🔍 Column [${index}] "${title}": id=${column?.id}, documentId=${column?.documentId}, using=${columnId}, type=${typeof columnId}`);
      
      return {
        value: columnId,
        label: title || `Rubrica #${columnId}`,
      };
    })
    .filter((option): option is { value: string | number; label: string } => option !== null);

  // Debug logging
  console.log('✅ Valid columns:', validColumns.length);
  console.log('📋 Column options:', columnOptions.length);
  console.log('📋 Column options details:', columnOptions.map(opt => ({ value: opt.value, label: opt.label })));

  const handleColumnSelect = (columnId: string | number | null) => {
    if (columnId) {
      // Find the selected option to log its details
      const selectedOption = columnOptions.find(opt => {
        return String(opt.value) === String(columnId) || opt.value === columnId;
      });
      console.log('🎯 Selected column option:', {
        receivedId: columnId,
        receivedType: typeof columnId,
        selectedOption,
      });
      
      const path = `/columns/${columnId}/links`;
      console.log('🚀 Navigating to:', path, 'for column ID:', columnId, 'Type:', typeof columnId);
      // Use replace to avoid adding to history stack
      // This might help with the 404 error
      navigate(path, { replace: false });
    }
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
        <div className="flex items-center gap-3 mb-2">
          <LinkIcon className="text-primary-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">
            Seleziona la Rubrica per Gestire i Link
          </h1>
        </div>
        <p className="text-gray-600 mt-1">
          Scegli una rubrica dalla lista per aggiungere o modificare i suoi link
        </p>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : columnOptions.length === 0 ? (
          <div className="text-center py-12">
            <Columns className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-4">
              Nessuna rubrica disponibile. Crea una rubrica prima di aggiungere link.
            </p>
            <Link
              to="/columns/new"
              className="btn-primary inline-block"
            >
              Crea Nuova Rubrica
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              {columnOptions.length > 0 ? (
                <>
                  <Select
                    label="Seleziona Rubrica"
                    value={null}
                    onChange={handleColumnSelect}
                    options={columnOptions}
                    placeholder="Scegli una rubrica dalla lista..."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Seleziona una rubrica per gestire i suoi link. Verrai reindirizzato automaticamente alla pagina di gestione.
                  </p>
                </>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    ⚠️ Nessuna rubrica valida trovata.
                  </p>
                  <p className="text-xs text-yellow-700">
                    Rubriche totali: {columns?.data?.length || 0} | Rubriche valide: {validColumns.length}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Controlla la console per i dettagli.
                  </p>
                </div>
              )}
            </div>

            {validColumns.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Rubriche disponibili ({validColumns.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {validColumns.map((column) => {
                    // Prioritize numeric id over documentId for API compatibility
                    const columnId = typeof column?.id === 'number' ? column.id : (column?.id ?? column?.documentId);
                    const title = column?.title ?? column?.attributes?.title;
                    const description = column?.description ?? column?.attributes?.description;
                    const cover = column?.cover ?? column?.attributes?.cover;
                    const coverImageUrl = extractCoverImage(cover);
                    
                    // Extract author info - handle both Strapi v4 and v5 structures
                    let authorName: string | undefined;
                    let authorAvatar: any;
                    
                    if (column?.author) {
                      // Strapi v5: direct author object
                      authorName = column.author.name;
                      authorAvatar = column.author.avatar;
                    } else if (column?.attributes?.author?.data?.attributes) {
                      // Strapi v4: author in attributes.data.attributes
                      authorName = column.attributes.author.data.attributes.name;
                      authorAvatar = column.attributes.author.data.attributes.avatar;
                    }
                    
                    const avatarImageUrl = extractAvatarImage(authorAvatar);
                    
                    return (
                      <Link
                        key={columnId}
                        to={`/columns/${columnId}/links`}
                        className="block rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all overflow-hidden bg-white group"
                      >
                        {/* Cover Image */}
                        <div className="relative h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {coverImageUrl ? (
                            <img
                              src={coverImageUrl}
                              alt={title || 'Rubrica'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Hide image on error, show gradient background instead
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                              <Columns className="text-primary-400" size={48} />
                            </div>
                          )}
                          {/* Overlay gradient for better text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                                {title || 'Senza titolo'}
                              </h4>
                              {description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {description}
                                </p>
                              )}
                              {authorName && (
                                <div className="flex items-center gap-2 mt-2">
                                  {avatarImageUrl ? (
                                    <img
                                      src={avatarImageUrl}
                                      alt={authorName}
                                      className="w-6 h-6 rounded-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                                      <span className="text-xs font-medium text-primary-600">
                                        {authorName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-xs text-gray-500">di {authorName}</span>
                                </div>
                              )}
                            </div>
                            <LinkIcon
                              size={18}
                              className="text-primary-600 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
