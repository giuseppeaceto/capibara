import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string | number;
  label: string;
  avatar?: string | null;
}

interface SelectProps {
  value?: string | number | null;
  onChange: (value: string | number | null) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function Select({
  value,
  onChange,
  options,
  label,
  placeholder = 'Seleziona...',
  required = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Select component received:', {
      label,
      optionsCount: options.length,
      options,
      value,
      selectedOption: options.find((opt) => opt.value === value),
    });
  }, [options, value, label]);

  const selectedOption = options.find((opt) => {
    // Handle both string and number comparisons
    return String(opt.value) === String(value) || opt.value === value;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string | number | null) => {
    console.log('🎯 Select.handleSelect called with:', {
      optionValue,
      optionType: typeof optionValue,
      optionLabel: options.find(opt => opt.value === optionValue)?.label,
    });
    // Close dropdown first
    setIsOpen(false);
    // Then trigger onChange with a small delay to ensure dropdown is closed
    setTimeout(() => {
      onChange(optionValue);
    }, 50);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="input w-full text-left flex items-center justify-between cursor-pointer"
        required={required}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption ? (
            <>
              {selectedOption.avatar ? (
                <img
                  src={selectedOption.avatar}
                  alt={selectedOption.label}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    {selectedOption.label.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSelect(null);
            }}
            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
              !value ? 'bg-primary-50' : ''
            }`}
          >
            <span className="text-gray-500">{placeholder}</span>
          </button>
          {options.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Nessun autore disponibile
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  console.log('🖱️ Select option clicked:', {
                    value: option.value,
                    valueType: typeof option.value,
                    label: option.label,
                  });
                  // Small delay to ensure event is fully handled
                  requestAnimationFrame(() => {
                    handleSelect(option.value);
                  });
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                  (String(value) === String(option.value) || value === option.value) ? 'bg-primary-50' : ''
                }`}
              >
                {option.avatar ? (
                  <img
                    src={option.avatar}
                    alt={option.label}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-gray-500">
                      {option.label.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="truncate">{option.label}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
