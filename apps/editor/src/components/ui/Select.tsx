interface SelectOption {
  value: string | number;
  label: string;
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
  return (
    <div>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="input"
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
