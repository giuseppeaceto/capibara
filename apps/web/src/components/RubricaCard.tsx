import { extractHeroImage, type Author } from "@/lib/api";
import { Globe } from "lucide-react";

// Helper function to extract author data from different possible structures
export function extractAuthorData(authorData: any): Author | undefined {
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

interface RubricaCardProps {
  item: any;
  index: number;
  compact?: boolean;
}

export default function RubricaCard({ item, index, compact = false }: RubricaCardProps) {
  const externalMetadata = item.externalMetadata || {};
  const author = extractAuthorData(item.author);
  const publishDate = item.publishDate ? new Date(item.publishDate) : null;

  return (
    <div key={index} className="content-box overflow-hidden border-l-4 border-zinc-200 hover:border-zinc-900 transition-colors flex flex-col">
      <div className={`${compact ? 'p-3' : 'p-5'} flex-1 min-w-0`}>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className={`font-semibold ${compact ? 'text-base' : 'text-lg'} hover:underline decoration-2 underline-offset-4 line-clamp-2 flex items-center gap-2`}>
          {item.label}
        </a>
        {item.description && <p className={`text-sm newsroom-card-description ${compact ? 'mt-1 leading-relaxed line-clamp-2' : 'mt-2 leading-relaxed line-clamp-3'}`}>{item.description}</p>}

        {/* External metadata preview */}
        {externalMetadata.title && (
          <div className={`mt-2 p-2 rounded-md newsroom-preview-box`}>
            <div className="flex items-start gap-2">
              <Globe className="h-3 w-3 text-zinc-400 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                {externalMetadata.siteName && (
                  <div className="text-xs newsroom-preview-text mb-1">
                    {externalMetadata.siteName}
                  </div>
                )}
                <div className="text-xs font-medium newsroom-preview-text line-clamp-1">
                  {externalMetadata.title}
                </div>
                {externalMetadata.description && (
                  <div className="text-xs newsroom-preview-text mt-1 line-clamp-2">
                    {externalMetadata.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className={`${compact ? 'mt-2 pt-2' : 'mt-4 pt-4'} border-t border-zinc-100 dark:border-zinc-800`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {author?.avatar && (
                <div className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 overflow-hidden flex items-center justify-center shrink-0`}>
                  <img
                    src={extractHeroImage(author.avatar).url ?? ""}
                    alt={author.name}
                    className="w-full h-full object-contain translate-y-1.5 scale-110"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-xs text-zinc-500">
                  Da <span className="newsroom-rubrica-title font-medium" style={{ fontWeight: '600' }}>{item.column.title}</span>
                </div>
                {author?.name && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${compact ? 'text-[10px]' : ''}`}>
                    {author.name}
                  </span>
                )}
              </div>
            </div>
            {publishDate && (
              <div className="text-xs text-zinc-400 whitespace-nowrap">
                {formatDate(publishDate)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
