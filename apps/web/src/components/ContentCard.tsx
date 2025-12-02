import Link from "next/link";
import Image from "next/image";
import type { Show } from "@/lib/api";
import { getStrapiMediaUrl } from "@/lib/api";

type ContentTile = {
  title: string;
  date: string;
  summary: string;
  tag: string;
  accent: string;
  locked?: boolean;
  slug?: string;
  type?: "video" | "podcast" | "newsletter" | "article";
  imageUrl?: string | null;
  imageAlt?: string | null;
};

const kindAccent: Record<Show["kind"], string> = {
  video: "from-purple-500/30 via-fuchsia-500/20 to-amber-400/30",
  podcast: "from-teal-500/30 via-sky-500/20 to-blue-900/40",
  newsletter: "from-yellow-500/20 via-orange-600/20 to-red-700/30",
};

export const formatDate = (iso?: string | null) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const getKindAccent = (kind: Show["kind"]) => kindAccent[kind];

export default function ContentCard({ entry }: { entry: ContentTile }) {
  const getHref = () => {
    if (!entry.slug || !entry.type) return "#";
    if (entry.type === "article") return `/articoli/${entry.slug}`;
    return `/${entry.type}/${entry.slug}`;
  };
  
  const href = getHref();
  
  // entry.imageUrl is already a full URL from getStrapiMediaUrl, so use it directly
  // Only call getStrapiMediaUrl if it's a relative path
  const cardImageUrl = entry.imageUrl 
    ? (entry.imageUrl.startsWith('http://') || entry.imageUrl.startsWith('https://'))
      ? entry.imageUrl
      : getStrapiMediaUrl(entry.imageUrl)
    : null;

  // Debug log in development
  if (process.env.NODE_ENV === 'development' && entry.type === 'video') {
    console.log('ContentCard imageUrl:', {
      title: entry.title,
      imageUrl: entry.imageUrl,
      cardImageUrl,
      hasImage: !!cardImageUrl,
    });
  }

  const CardContent = (
    <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-br p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-white/25 cursor-pointer">
      <div className={`relative h-40 rounded-2xl overflow-hidden bg-gradient-to-r ${entry.accent}`}>
        {cardImageUrl ? (
          <Image
            src={cardImageUrl}
            alt={entry.imageAlt || entry.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
            unoptimized={cardImageUrl.includes('localhost') || cardImageUrl.includes('127.0.0.1')}
          />
        ) : null}
        {/* overlay leggera per mantenere leggibilità e mood del brand */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-zinc-400">
          <span>{entry.tag}</span>
          {entry.locked && (
            <span className="rounded-full bg-amber-400/10 px-3 py-0.5 text-xs text-amber-200">
              Abbonati
            </span>
          )}
        </div>
        <h3 className="text-xl font-semibold text-white">{entry.title}</h3>
        <p className="text-sm text-zinc-400 line-clamp-2">{entry.summary}</p>
      </div>
      <div className="mt-auto text-xs uppercase tracking-wide text-zinc-500">
        {entry.date}
      </div>
    </article>
  );

  if (entry.slug && entry.type) {
    return (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}

