import { useState, useRef, useEffect } from 'react';
import { X, Check, Search } from 'lucide-react';

interface Option {
  id: number;
  label: string;
}

interface MultiSelectProps {
  value: number[];
  onChange: (value: number[]) => void;
  options: Option[];
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  onCreateNew?: (label: string) => Promise<Option>;
}

export default function MultiSelect({
  value,
  onChange,
  options,
  label,
  placeholder = 'Seleziona...',
  searchable = true,
  onCreateNew,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOptions = options.filter((opt) => value.includes(opt.id));
  const filteredOptions = options.filter(
    (opt) =>
      !searchTerm ||
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (optionId: number) => {
    if (value.includes(optionId)) {
      onChange(value.filter((id) => id !== optionId));
    } else {
      onChange([...value, optionId]);
    }
  };

  const removeOption = (optionId: number) => {
    onChange(value.filter((id) => id !== optionId));
  };

  const handleCreateNew = async () => {
    if (!onCreateNew || !searchTerm.trim()) return;

    try {
      const newOption = await onCreateNew(searchTerm.trim());
      onChange([...value, newOption.id]);
      setSearchTerm('');
    } catch (error) {
      console.error('Error creating new option:', error);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="label">{label}</label>}

      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedOptions.map((option) => (
          <span
            key={option.id}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
          >
            <span>{option.label}</span>
            <button
              type="button"
              onClick={() => removeOption(option.id)}
              className="hover:text-primary-900"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      {/* Input/Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="input cursor-pointer flex items-center justify-between"
      >
        <span className={selectedOptions.length > 0 ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOptions.length > 0
            ? `${selectedOptions.length} selezionati`
            : placeholder}
        </span>
        <span className="text-gray-400">▼</span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Cerca..."
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {searchTerm ? (
                  <>
                    Nessun risultato per "{searchTerm}"
                    {onCreateNew && (
                      <button
                        type="button"
                        onClick={handleCreateNew}
                        className="block mt-2 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Crea "{searchTerm}"
                      </button>
                    )}
                  </>
                ) : (
                  'Nessuna opzione disponibile'
                )}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                >
                  <span
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                      value.includes(option.id)
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {value.includes(option.id) && (
                      <Check size={12} className="text-white" />
                    )}
                  </span>
                  <span className="flex-1">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
