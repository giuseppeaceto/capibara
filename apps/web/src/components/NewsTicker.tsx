"use client";

import Link from "next/link";

export type TickerItem = {
  title: string;
  href: string;
};

export interface NewsTickerProps {
  items: TickerItem[];
  isDark?: boolean;
}

function TickerSet({ items, offset, isDark }: { items: TickerItem[]; offset: number; isDark: boolean }) {
  return (
    <>
      {items.map((item, i) => (
        <Link
          key={`${offset}-${i}`}
          href={item.href}
          className={`inline-flex items-center gap-3 px-5 py-1.5 hover:underline underline-offset-2 decoration-1 transition-colors whitespace-nowrap ${
            isDark
              ? "text-zinc-200/90 hover:text-white decoration-white/30"
              : "text-zinc-700 hover:text-zinc-900 decoration-zinc-400/40"
          }`}
        >
          <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>·</span>
          <span>{item.title}</span>
        </Link>
      ))}
    </>
  );
}

export default function NewsTicker({ items, isDark = false }: NewsTickerProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={`news-ticker pointer-events-auto rounded-2xl border backdrop-blur-xl ${
        isDark
          ? "bg-zinc-900/70 border-white/10"
          : "bg-white/70 border-zinc-200/60"
      }`}
      style={{
        backdropFilter: "blur(16px) saturate(150%)",
        WebkitBackdropFilter: "blur(16px) saturate(150%)",
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.25)"
          : "0 4px 24px rgba(0,0,0,0.08)",
      }}
      role="marquee"
      aria-label="Ultime notizie"
    >
      <div className="flex items-center px-4 sm:px-5 py-2 text-xs">
        <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest mr-3 ${
          isDark
            ? "bg-red-500/20 text-red-300 border border-red-500/20"
            : "bg-red-50 text-red-600 border border-red-200/60"
        }`}>
          Ultime
        </span>

        <div className="ticker-fade-mask flex-1 overflow-hidden">
          <div className="news-ticker-track">
            <TickerSet items={items} offset={0} isDark={isDark} />
            <TickerSet items={items} offset={1} isDark={isDark} />
          </div>
        </div>
      </div>
    </div>
  );
}
