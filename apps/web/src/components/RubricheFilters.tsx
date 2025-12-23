"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, BookOpen, User, Calendar, CalendarDays, Clock, Sparkles } from "lucide-react";
import CustomDropdown from "./CustomDropdown";

interface Column {
  title: string;
  slug: string;
}

interface Author {
  name: string;
}

interface RubricheFiltersProps {
  columns: Column[];
  authors: Author[];
  selectedColumn?: string;
  selectedAuthor?: string;
  selectedDate?: string;
}

export default function RubricheFilters({
  columns,
  authors,
  selectedColumn,
  selectedAuthor,
  selectedDate,
}: RubricheFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (filterType: "column" | "author" | "date", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Ensure we're in "all" view
    params.set("rubriche", "all");
    
    if (value === "all") {
      if (filterType === "column") {
        params.delete("filterColumn");
      } else if (filterType === "author") {
        params.delete("filterAuthor");
      } else if (filterType === "date") {
        params.delete("filterDate");
      }
    } else {
      if (filterType === "column") {
        params.set("filterColumn", value);
      } else if (filterType === "author") {
        params.set("filterAuthor", value);
      } else if (filterType === "date") {
        params.set("filterDate", value);
      }
    }
    
    // Reset to first page when filtering
    params.set("rubrichePage", "1");
    
    router.push(`/newsletter?${params.toString()}`);
  };

  // Get unique authors (remove duplicates)
  const uniqueAuthors = Array.from(
    new Map(authors.map(author => [author.name, author])).values()
  );

  // Prepare column options with icons
  const columnOptions = [
    { value: "all", label: "Tutte le rubriche", icon: BookOpen },
    ...columns.map((column) => ({
      value: column.slug,
      label: column.title,
      icon: BookOpen,
    })),
  ];

  // Prepare author options with icons
  const authorOptions = [
    { value: "all", label: "Tutti gli autori", icon: User },
    ...uniqueAuthors.map((author) => ({
      value: author.name,
      label: author.name,
      icon: User,
    })),
  ];

  // Prepare date options with icons
  const dateOptions = [
    { value: "all", label: "Tutte le date", icon: Calendar },
    { value: "today", label: "Oggi", icon: Sparkles },
    { value: "7days", label: "Ultimi 7 giorni", icon: Clock },
    { value: "30days", label: "Ultimi 30 giorni", icon: CalendarDays },
    { value: "90days", label: "Ultimi 3 mesi", icon: Calendar },
    { value: "6months", label: "Ultimi 6 mesi", icon: Calendar },
  ];

  return (
    <div className="rubriche-filters-box flex flex-wrap items-center gap-4 mb-6 p-4 rounded-lg">
      <div className="rubriche-filters-label flex items-center gap-2 text-sm font-medium">
        <Filter className="h-4 w-4" />
        <span>Filtra per:</span>
      </div>
      
      <div className="flex flex-wrap gap-4">
        {/* Rubrica Filter */}
        <CustomDropdown
          label="Rubrica"
          options={columnOptions}
          value={selectedColumn}
          onChange={(value) => handleFilterChange("column", value)}
          placeholder="Tutte le rubriche"
        />

        {/* Author Filter */}
        <CustomDropdown
          label="Autore"
          options={authorOptions}
          value={selectedAuthor}
          onChange={(value) => handleFilterChange("author", value)}
          placeholder="Tutti gli autori"
        />

        {/* Date Filter */}
        <CustomDropdown
          label="Periodo"
          options={dateOptions}
          value={selectedDate}
          onChange={(value) => handleFilterChange("date", value)}
          placeholder="Tutte le date"
        />

        {/* Reset filters button */}
        {(selectedColumn || selectedAuthor || selectedDate) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("rubriche", "all");
                params.delete("filterColumn");
                params.delete("filterAuthor");
                params.delete("filterDate");
                params.set("rubrichePage", "1");
                router.push(`/newsletter?${params.toString()}`);
              }}
              className="rubriche-filters-reset px-3 py-1.5 text-sm underline underline-offset-2 whitespace-nowrap"
            >
              Rimuovi filtri
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

