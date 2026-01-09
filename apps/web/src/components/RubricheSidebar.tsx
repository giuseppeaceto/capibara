"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { extractHeroImage, type Author } from "@/lib/api";

interface Column {
  title: string;
  slug: string;
  description?: string | null;
  author?: any;
  cover?: any;
}

interface RubricheSidebarProps {
  columns: Column[];
  selectedColumnSlug?: string | null;
}

// Helper function to extract author data from different possible structures
function extractAuthorData(authorData: any): Author | undefined {
  if (!authorData) return undefined;
  return authorData?.data?.attributes || authorData?.attributes || authorData;
}

export default function RubricheSidebar({ columns, selectedColumnSlug }: RubricheSidebarProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6; // Numero di rubriche per pagina
  const totalPages = Math.ceil(columns.length / itemsPerPage);

  // Reset alla prima pagina quando cambia la colonna selezionata
  useEffect(() => {
    if (selectedColumnSlug) {
      const selectedIndex = columns.findIndex(c => c.slug === selectedColumnSlug);
      if (selectedIndex >= 0) {
        const page = Math.floor(selectedIndex / itemsPerPage);
        setCurrentPage(page);
      }
    }
  }, [selectedColumnSlug, columns, itemsPerPage]);

  // Calcola le rubriche da mostrare nella pagina corrente
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentColumns = columns.slice(startIndex, endIndex);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
        <h2 className="text-xl font-bold uppercase tracking-tight">Le Rubriche</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {currentColumns.map((column, i) => {
          const author = extractAuthorData(column.author);
          const isSelected = selectedColumnSlug === column.slug;
          const actualIndex = startIndex + i;

          const coverImage = column.cover ? extractHeroImage(column.cover) : null;

          return (
            <Link
              key={column.slug}
              href={`/newsroom?column=${column.slug}`}
              className={`content-box p-3 space-y-2 transition-all ${
                isSelected
                  ? "border-zinc-900 bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-900"
                  : "border-zinc-100 hover:border-zinc-900 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm"
              }`}
            >
              {coverImage?.url && (
                <div className="w-full h-20 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-2">
                  <img
                    src={coverImage.url}
                    alt={column.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className="font-bold text-xs leading-tight">{column.title}</h3>

              {!isSelected && column.description && (
                <p className="text-[10px] newsroom-card-description italic leading-relaxed line-clamp-1">
                  &ldquo;{column.description}&rdquo;
                </p>
              )}

              <div className="flex items-center gap-2">
                {author?.avatar && (
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-100 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={extractHeroImage(author.avatar).url ?? ""}
                      alt={author?.name || "Autore"}
                      className="w-full h-full object-contain translate-y-1 scale-110"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="mt-0.5">
                    {author?.name ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                        {author.name}
                      </span>
                    ) : (
                      <span className="text-[9px] text-zinc-600 dark:text-zinc-400 truncate">
                        Redazione
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="pt-1">
                  <span className="text-[9px] font-bold newsroom-featured-text flex items-center gap-1 uppercase tracking-wider">
                     In primo piano <span className="text-xs">✨</span>
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Indicatori di paginazione */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`rubriche-pagination-dot transition-all ${
                i === currentPage
                  ? "rubriche-pagination-dot-active"
                  : "rubriche-pagination-dot-inactive"
              }`}
              aria-label={`Vai alla pagina ${i + 1}`}
              title={`Pagina ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
