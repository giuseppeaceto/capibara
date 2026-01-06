"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  avatar?: string | null;
}

interface CustomDropdownProps {
  label: string;
  options: DropdownOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Seleziona...",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options.find((opt) => opt.value === "all");

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="rubriche-filters-dropdown-label text-sm mb-1 block">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rubriche-filters-dropdown-button flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md transition-colors min-w-[160px] justify-between"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption?.avatar ? (
            <img
              src={selectedOption.avatar}
              alt=""
              className="h-4 w-4 rounded-full flex-shrink-0 object-cover"
            />
          ) : selectedOption?.icon ? (
            <selectedOption.icon className="h-4 w-4 flex-shrink-0" />
          ) : null}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="rubriche-filters-dropdown-menu absolute z-50 mt-1 w-full border rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = option.value === value || (value === undefined && option.value === "all");
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`rubriche-filters-dropdown-item w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                  isSelected
                    ? "font-medium"
                    : ""
                }`}
              >
                {option.avatar ? (
                  <img
                    src={option.avatar}
                    alt=""
                    className="h-4 w-4 rounded-full flex-shrink-0 object-cover"
                  />
                ) : Icon ? (
                  <Icon className="h-4 w-4 flex-shrink-0" />
                ) : null}
                <span className="flex-1">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

