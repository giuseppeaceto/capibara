"use client";

import React from "react";
import {
  Archive,
  BadgeEuro,
  Headphones,
  Home as HomeIcon,
  List,
  Lock,
  Mail,
  MessageCircle,
  PlayCircle,
  Search,
  Star,
  Timer,
  Sun,
  Moon,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

type NavLink = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  notify?: boolean;
  locked?: boolean;
  children?: string[];
};

const CapibaraLogoIcon: React.FC<{ 
  className?: string;
  isDark?: boolean;
  isActive?: boolean;
}> = ({ className, isDark = true, isActive = false }) => {
  // In light mode e non attivo: usa logo nero
  // In dark mode o attivo: usa logo bianco
  const logoSrc = (!isDark && !isActive) 
    ? "/logo_capibara_nero.png" 
    : "/logo_capibara.png";
  
  return (
    <Image
      src={logoSrc}
      alt="Capibara"
      width={24}
      height={24}
      className={`rounded-md bg-white/5 object-contain p-0.5 ${className ?? ""}`}
    />
  );
};

const primaryNav: NavLink[] = [
  { label: "Home", icon: HomeIcon, href: "/" },
  { label: "Feed", icon: List, href: "/feed" },
  { label: "Articoli", icon: Timer, href: "/articoli" },
  { label: "Podcast", icon: Headphones, href: "/podcast" },
  { label: "Video", icon: PlayCircle, href: "/video" },
  {
    label: "Newsletter",
    icon: Mail,
    href: "/newsletter",
    locked: true,
    children: ["Capibara Insider", "Deep Dive"],
  },
  { label: "Archivio", icon: Archive, href: "/archivio" },
  { label: "Contenuti Extra", icon: Star, href: "/extra", locked: true },
];

const utilityNav: NavLink[] = [
  { label: "Chi siamo", icon: CapibaraLogoIcon, href: "/chi-siamo" },
  { label: "Abbonamenti", icon: BadgeEuro, href: "/abbonamenti" },
  { label: "Partner", icon: Users, href: "/partner" },
];

const NavGroup = ({
  title,
  links,
  currentPath,
  isDark,
}: {
  title?: string;
  links: NavLink[];
  currentPath: string;
  isDark: boolean;
}) => (
  <div className="space-y-1">
    {title && (
      <p
        className={`px-3 text-xs font-semibold uppercase tracking-[0.25em] ${
          isDark ? "text-zinc-500" : "text-zinc-500"
        }`}
      >
        {title}
      </p>
    )}
    {links.map((item) => {
      const isActive = currentPath === item.href;
      const baseClasses = isDark
        ? isActive
          ? "bg-white/10 text-white"
          : "text-zinc-300 hover:bg-white/5"
        : isActive
          ? "bg-zinc-900 text-white"
          : "text-zinc-700 hover:bg-zinc-100";

      const iconClasses = isDark
        ? isActive
          ? "text-white"
          : "text-zinc-500"
        : isActive
          ? "text-white"
          : "text-zinc-500";

      const lockedClasses = isDark
        ? "bg-white/10 text-white/70"
        : "bg-zinc-900 text-zinc-100";

      const childrenBorder = isDark ? "border-white/10" : "border-zinc-200";
      const childrenText = isDark ? "text-zinc-500" : "text-zinc-500";

      return (
        <Link
          key={item.label}
          href={item.href}
          className={`flex flex-col rounded-2xl px-3 py-2 text-sm transition ${baseClasses}`}
        >
          <div className="flex items-center gap-3">
            {item.icon === CapibaraLogoIcon ? (
              <CapibaraLogoIcon 
                className={`h-4 w-4 ${iconClasses}`}
                isDark={isDark}
                isActive={isActive}
              />
            ) : (
              <item.icon className={`h-4 w-4 ${iconClasses}`} />
            )}
            <span className="flex-1">{item.label}</span>
            {item.locked && (
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${lockedClasses}`}
              >
                <Lock className="h-3 w-3" />
                Solo membri
              </span>
            )}
            {item.notify && (
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            )}
          </div>
          {item.children && (
            <div
              className={`mt-2 space-y-1 border-l pl-5 text-xs ${childrenBorder} ${childrenText}`}
            >
              {item.children.map((child) => (
                <div key={child}>{child}</div>
              ))}
            </div>
          )}
        </Link>
      );
    })}
  </div>
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Leggi il tema dal localStorage all'inizializzazione, con fallback a "dark"
  const [theme, setTheme] = React.useState<"dark" | "light">(() => {
    // Solo lato client (localStorage non esiste durante SSR)
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("capibara-theme") as "dark" | "light" | null;
      return savedTheme || "dark";
    }
    return "dark";
  });

  // Salva il tema nel localStorage e applica all'elemento html quando cambia
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("capibara-theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <div
      data-theme={theme}
      className={`flex min-h-screen ${
        isDark ? "bg-[#050505] text-white" : "bg-zinc-50 text-zinc-900"
      }`}
    >
      <aside
        className={`sticky top-0 hidden h-screen w-72 flex-shrink-0 flex-col px-4 py-6 lg:flex ${
          isDark ? "border-r border-white/5 bg-black/40" : "border-r border-zinc-200 bg-white"
        }`}
      >
        <Link href="/" className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <Image
              src={isDark ? "/logo_capibara.png" : "/logo_capibara_nero.png"}
              alt="Capibara logo"
              width={64}
              height={64}
              className="h-14 w-14 rounded-2xl bg-white/5 object-contain p-2"
              priority
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`text-base font-semibold tracking-wide ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  Capibara
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border ${
                    isDark
                      ? "border-amber-400 text-amber-300 bg-amber-400/10"
                      : "border-amber-500 text-amber-600 bg-amber-100"
                  }`}
                >
                  Alpha
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">
                Storie da chi non ha potere
              </span>
            </div>
          </div>
        </Link>
        <div className="mt-8 flex-1 space-y-8 overflow-y-auto">
          <NavGroup links={primaryNav} currentPath={pathname} isDark={isDark} />
          <NavGroup
            title="Community"
            links={utilityNav}
            currentPath={pathname}
            isDark={isDark}
          />
        </div>
        <div className="mt-4 space-y-3 border-t border-white/5 pt-4 text-xs text-zinc-500">
          <p className="flex flex-wrap gap-2">
            <span>Contattaci</span>
            <span>•</span>
            <span>Diventa partner</span>
          </p>
          <p className="flex flex-wrap gap-2">
            <Link href="/privacy" className="hover:text-zinc-300">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/termini" className="hover:text-zinc-300">
              Termini
            </Link>
          </p>
        </div>
      </aside>

      <div className="flex-1">
        <div
          className={`flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-12 ${
            isDark
              ? "border-b border-white/5 bg-black/30"
              : "border-b border-zinc-200 bg-white/70 backdrop-blur"
          }`}
        >
          <div className="flex justify-end">
            <div className="flex gap-3 text-sm">
              {session ? (
                <>
                  <span
                    className={`hidden sm:inline ${
                      isDark ? "text-zinc-300" : "text-zinc-700"
                    }`}
                  >
                    Ciao, {session.user?.name ?? "utente"}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      isDark
                        ? "border border-white/10 text-zinc-300 hover:border-white/40 hover:text-white"
                        : "border border-zinc-300 text-zinc-800 hover:border-zinc-900 hover:text-zinc-900 bg-white"
                    }`}
                  >
                    Esci
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const newTheme = theme === "dark" ? "light" : "dark";
                      setTheme(newTheme);
                    }}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isDark
                        ? "border border-white/10 bg-white/5 text-zinc-200 hover:border-white/40 hover:bg-white/10"
                        : "border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900 hover:text-zinc-900"
                    }`}
                  >
                    {isDark ? (
                      <>
                        <Moon className="h-3.5 w-3.5" />
                        <span>Dark</span>
                      </>
                    ) : (
                      <>
                        <Sun className="h-3.5 w-3.5 text-amber-500" />
                        <span>Light</span>
                      </>
                    )}
                  </button>
                  <Link
                    href="/login"
                    className="rounded-full bg-white/90 px-4 py-2 font-semibold text-black"
                  >
                    Accedi
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
              <form
                action="/archivio"
                method="get"
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 ${
                  isDark
                    ? "border border-white/10 bg-white/5"
                    : "border border-zinc-300 bg-white"
                }`}
              >
                <Search
                  className={`h-4 w-4 ${
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  }`}
                />
                <input
                  name="q"
                  type="search"
                  className={`w-full bg-transparent text-sm focus:outline-none ${
                    isDark
                      ? "text-white placeholder:text-zinc-500"
                      : "text-zinc-900 placeholder:text-zinc-400"
                  }`}
                  placeholder="Cerca episodi, podcast o newsletter"
                />
              </form>
            </div>
          </div>
        </div>

        <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

