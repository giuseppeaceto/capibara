import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { ArrowLeft, AlertCircle, Loader2, Plus, X, Link as LinkIcon } from 'lucide-react';

interface LinkItem {
  label: string;
  url: string;
  description?: string;
  publishDate?: string;
}

export default function ManageColumnLinksPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newLinks, setNewLinks] = useState<LinkItem[]>([]);
  const [existingLinksCount, setExistingLinksCount] = useState(0);

  const { data: columnData, isLoading, error: queryError } = useQuery({
    queryKey: ['columns', id, 'links'],
    queryFn: async () => {
      if (!id) {
        throw new Error('Column ID is required');
      }
      
      const numericId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
      
      try {
        return await apiClient.findOne('columns', numericId, {
          populate: ['links'],
        });
      } catch (error) {
        // If numeric ID fails with 404, try to fetch all columns and find by documentId
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          
          if (axiosError.response?.status === 404) {
            try {
              const allColumns = await apiClient.find('columns', {
                populate: ['links'],
                pagination: { limit: 100 },
              });
              
              let foundColumn = allColumns.data?.find((col: any) => {
                const colId = typeof col?.id === 'number' ? col.id : col?.id;
                return String(colId) === String(numericId) || colId === numericId;
              });
              
              if (!foundColumn && typeof id === 'string') {
                foundColumn = allColumns.data?.find((col: any) => {
                  return col?.documentId === id;
                });
              }
              
              if (foundColumn) {
                return {
                  data: foundColumn,
                  meta: allColumns.meta,
                };
              }
            } catch (fetchAllError) {
              // Fall through to throw original error
            }
          }
        }
        
        throw error;
      }
    },
    enabled: !!id,
    retry: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Count existing links
  useEffect(() => {
    if (columnData?.data) {
      // Handle both Strapi v4 (attributes) and v5 (direct) structures
      const column = columnData.data;
      const links = column?.links ?? column?.attributes?.links ?? [];
      const linksArray = Array.isArray(links) ? links : [];
      setExistingLinksCount(linksArray.length);
    }
  }, [columnData]);

  const mutation = useMutation({
    mutationFn: async (linksToAdd: LinkItem[]) => {
      // Get existing links first
      const column = columnData?.data;
      const existingLinks = column?.links ?? column?.attributes?.links ?? [];
      const existingLinksArray = Array.isArray(existingLinks) ? existingLinks : [];
      
      // Format existing links
      const formattedExisting = existingLinksArray.map((link: any) => ({
        label: link?.label ?? link?.attributes?.label ?? '',
        url: link?.url ?? link?.attributes?.url ?? '',
        description: link?.description ?? link?.attributes?.description ?? null,
        publishDate: link?.publishDate ?? link?.attributes?.publishDate ?? null,
      }));

      // Combine existing + new links
      const allLinks = [
        ...formattedExisting,
        ...linksToAdd.map((link) => ({
          label: link.label,
          url: link.url,
          description: link.description || null,
          publishDate: link.publishDate || null,
        })),
      ];

      const data: Record<string, unknown> = {
        links: allLinks,
      };

      const numericId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
      const documentId = column?.documentId;

      // Try documentId first if available, otherwise fall back to numeric id
      if (documentId) {
        try {
          return await apiClient.update('columns', documentId, data);
        } catch (documentIdError) {
          // Fall through to try numeric id
        }
      }

      return apiClient.update('columns', numericId, data);
    },
    onSuccess: (data) => {
      if (data?.data) {
        const updatedColumn = data.data;
        
        // Update the cache for the current query key to prevent refetch
        queryClient.setQueryData(['columns', id, 'links'], data);
        
        // Also update cache for alternative ID formats to ensure consistency
        if (updatedColumn?.documentId && updatedColumn.documentId !== id) {
          queryClient.setQueryData(['columns', updatedColumn.documentId, 'links'], data);
        }
        if (updatedColumn?.id && String(updatedColumn.id) !== String(id)) {
          queryClient.setQueryData(['columns', updatedColumn.id, 'links'], data);
        }
      }
      
      // Invalidate general queries only, not the current one to avoid refetch
      queryClient.invalidateQueries({ 
        queryKey: ['columns', 'recent'],
        exact: true
      });
      queryClient.invalidateQueries({ 
        queryKey: ['columns', 'all'],
        exact: true
      });
      
      setError('');
      setSuccess(`✅ ${newLinks.length} link aggiunto/i con successo!`);
      setNewLinks([]);
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err: unknown) => {
      setError(
        err instanceof Error
          ? err.message
          : 'Errore durante il salvataggio. Riprova.'
      );
      setSuccess('');
    },
  });

  const handleAddLink = () => {
    setNewLinks([...newLinks, { label: '', url: '', description: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    setNewLinks(newLinks.filter((_, i) => i !== index));
  };

  const handleLinkChange = (
    index: number,
    field: keyof LinkItem,
    value: string
  ) => {
    setNewLinks(
      newLinks.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    
    if (newLinks.length === 0) {
      setError('Aggiungi almeno un link prima di salvare.');
      return;
    }
    
    // Validate links
    const invalidLinks = newLinks.filter(
      (link) => !link.label.trim() || !link.url.trim()
    );
    
    if (invalidLinks.length > 0) {
      setError('Tutti i link devono avere label e URL compilati.');
      return;
    }

    await mutation.mutateAsync(newLinks);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Errore nel caricamento della rubrica
          </h2>
          <p className="text-gray-600 mb-2">
            Impossibile caricare la rubrica con ID: {id}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {queryError instanceof Error ? queryError.message : 'Errore sconosciuto'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/columns/select-links" className="btn-primary inline-block">
              Seleziona un'altra rubrica
            </Link>
            <Link to="/" className="btn-secondary inline-block">
              Torna alla Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!columnData?.data) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      );
    }
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Rubrica non trovata
          </h2>
          <p className="text-gray-600 mb-4">
            La rubrica che stai cercando non esiste o è stata eliminata.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/columns/select-links" className="btn-primary inline-block">
              Seleziona un'altra rubrica
            </Link>
            <Link to="/" className="btn-secondary inline-block">
              Torna alla Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const column = columnData.data;
  const columnTitle = column?.title ?? column?.attributes?.title ?? 'Senza titolo';

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
            Aggiungi Link - {columnTitle}
          </h1>
        </div>
        <p className="text-gray-600 mt-1">
          Aggiungi nuovi link a questa rubrica {existingLinksCount > 0 && `(${existingLinksCount} link esistenti)`}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="card">
        <div className="space-y-6">
          {/* New Links Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="label text-lg">
                Nuovi Link da Aggiungere
              </label>
              <button
                type="button"
                onClick={handleAddLink}
                className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <Plus size={16} />
                <span>Aggiungi Link</span>
              </button>
            </div>

            {newLinks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8 border border-dashed border-gray-300 rounded-lg">
                Nessun nuovo link da aggiungere. Clicca "Aggiungi Link" per iniziare.
              </p>
            ) : (
              <div className="space-y-4">
                {newLinks.map((link, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Link #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Rimuovi link"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        placeholder="Descrizione opzionale del link..."
                      />
                    </div>

                    <div>
                      <label className="label text-xs">Data di pubblicazione (opzionale)</label>
                      <input
                        type="datetime-local"
                        value={
                          link.publishDate
                            ? new Date(link.publishDate).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) =>
                          handleLinkChange(
                            index,
                            'publishDate',
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : ''
                          )
                        }
                        className="input text-sm"
                        placeholder="Data di pubblicazione del link"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Link
              to={`/columns/${id}/edit`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Modifica rubrica
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={mutation.isPending || newLinks.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {mutation.isPending && <Loader2 className="animate-spin" size={16} />}
              <span>
                {mutation.isPending 
                  ? 'Salvataggio...' 
                  : newLinks.length === 0
                  ? 'Aggiungi almeno un link'
                  : `Aggiungi ${newLinks.length} link`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
