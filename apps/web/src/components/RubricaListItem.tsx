import { extractHeroImage, type Author } from "@/lib/api";
import { Globe } from "lucide-react";

// Helper function to extract author data from different possible structures
function extractAuthorData(authorData: any): Author | undefined {
  if (!authorData) return undefined;
  return authorData?.data?.attributes || authorData?.attributes || authorData;
}

const formatDate = (date: Date) => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'oggi';
  if (diffDays === 2) return 'ieri';
  if (diffDays <= 7) return `${diffDays - 1} giorni fa`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} settimane fa`;

  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

interface RubricaListItemProps {
  item: any;
  index: number;
}

export default function RubricaListItem({ item, index }: RubricaListItemProps) {
  const externalMetadata = item.externalMetadata || {};
  const author = extractAuthorData(item.author);
  const publishDate = item.publishDate ? new Date(item.publishDate) : null;

  return (
    <article className="py-3 first:pt-0">
      <div className="flex flex-col gap-2">
        {/* Header: Data e Rubrica */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {publishDate && (
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">{formatDate(publishDate)}</span>
          )}
          <span className="rubrica-list-rubrica-badge inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold">
            {item.column.title}
          </span>
        </div>

        {/* Titolo */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rubrica-list-title text-xl sm:text-2xl font-semibold leading-tight hover:underline decoration-2 underline-offset-2"
        >
          {item.label}
        </a>

        {/* Autore sotto il titolo */}
        {author?.name && (
          <div className="flex items-center gap-2 text-sm rubrica-list-author">
            {author?.avatar && (
              <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={extractHeroImage(author.avatar).url ?? ""}
                  alt={author.name}
                  className="w-full h-full object-contain translate-y-1.5 scale-110"
                />
              </div>
            )}
            <span>{author.name}</span>
          </div>
        )}
        
        {/* Descrizione */}
        {item.description && (
          <p className="text-sm rubrica-list-description leading-relaxed">
            {item.description}
          </p>
        )}

        {/* External metadata preview - più compatto */}
        {externalMetadata.title && (
          <div className="mt-1.5 flex items-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-500">
            <Globe className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              {externalMetadata.siteName && (
                <span className="font-medium">{externalMetadata.siteName}</span>
              )}
              {externalMetadata.siteName && externalMetadata.title && <span className="mx-1">•</span>}
              <span className="line-clamp-1">{externalMetadata.title}</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
