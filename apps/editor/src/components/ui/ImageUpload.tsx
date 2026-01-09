import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface ImageUploadProps {
  value?: { id: number; url: string } | null;
  onChange: (value: { id: number; url: string } | null) => void;
  label?: string;
  accept?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Immagine',
  accept = 'image/*',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Seleziona un file immagine valido');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Il file è troppo grande. Massimo 10MB');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const uploaded = await apiClient.upload(file);
      onChange(uploaded);
    } catch (err) {
      setError('Errore durante l\'upload. Riprova.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError('');
  };

  return (
    <div>
      {label && <label className="label">{label}</label>}
      
      {value ? (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
            <img
              src={value.url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              title="Rimuovi immagine"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="animate-spin text-primary-600" size={32} />
              <span className="text-sm text-gray-600">Upload in corso...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="text-gray-400" size={32} />
              <span className="text-sm text-gray-600">
                Clicca per caricare un'immagine
              </span>
              <span className="text-xs text-gray-500">
                JPG, PNG o GIF (max 10MB)
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
