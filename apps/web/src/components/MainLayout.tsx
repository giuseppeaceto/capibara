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
  UserCircle,
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
  color?: string; // Colore per quando è attivo (dark mode)
  colorLight?: string; // Colore per quando è attivo (light mode)
};

const CapibaraLogoIcon: React.FC<{ 
  className?: string;
  isDark?: boolean;
  isActive?: boolean;
}> = ({ className, isDark = true, isActive = false }) => {
  // In light mode e non attivo: usa icona nera
  // In dark mode o attivo: usa icona bianca
  const logoSrc = (!isDark && !isActive) 
    ? "/icon_black.png" 
    : "/icon_white.png";
  
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

// Social Media Icons
const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const primaryNav: NavLink[] = [
  { label: "Home", icon: HomeIcon, href: "/" },
  { label: "Feed", icon: List, href: "/feed" },
  { 
    label: "Articoli", 
    icon: Timer, 
    href: "/articoli",
    color: "bg-indigo-500/20 border-indigo-500/50 text-white",
    colorLight: "bg-indigo-100 border-indigo-500 text-indigo-900"
  },
  { 
    label: "Podcast", 
    icon: Headphones, 
    href: "/podcast",
    color: "bg-teal-500/20 border-teal-500/50 text-white",
    colorLight: "bg-teal-100 border-teal-500 text-teal-900"
  },
  { 
    label: "Video", 
    icon: PlayCircle, 
    href: "/video",
    color: "bg-purple-500/20 border-purple-500/50 text-white",
    colorLight: "bg-purple-100 border-purple-500 text-purple-900"
  },
  {
    label: "Newsletter",
    icon: Mail,
    href: "/newsletter",
    children: ["Capibara Insider", "Deep Dive"],
  },
  { label: "Archivio", icon: Archive, href: "/archivio" },
  { label: "Contenuti Extra", icon: Star, href: "/extra", locked: true },
];

const utilityNav: NavLink[] = [
  { label: "Chi siamo", icon: CapibaraLogoIcon, href: "/chi-siamo" },
  { label: "Redazione", icon: UserCircle, href: "/chi-siamo/redazione" },
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
}) => {
  // Controlla se c'è un link più specifico (più lungo) che corrisponde al pathname
  const hasMoreSpecificMatch = (href: string) => {
    return links.some(
      (link) =>
        link.href !== href &&
        link.href.startsWith(href + "/") &&
        currentPath.startsWith(link.href)
    );
  };

  return (
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
        // Gestisce sia path esatti che path che iniziano con l'href (es: /articoli/[slug])
        // Ma non attiva un link se c'è un link più specifico che corrisponde
        const isActive = 
          (currentPath === item.href || 
           (item.href !== "/" && currentPath.startsWith(item.href + "/"))) &&
          !hasMoreSpecificMatch(item.href);
      
      // Se il link ha un colore personalizzato, usalo quando è attivo
      const activeColorClass = isActive && item.color 
        ? (isDark ? item.color : item.colorLight || item.color)
        : null;
      
      const baseClasses = isDark
        ? isActive
          ? activeColorClass || "bg-white/10 text-white"
          : "text-zinc-300 hover:bg-white/5"
        : isActive
          ? activeColorClass || "bg-zinc-900 text-white"
          : "text-zinc-700 hover:bg-zinc-100";
      
      const borderClass = isActive && item.color
        ? "border"
        : "";

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
          className={`flex flex-col rounded-2xl px-3 py-2 text-sm transition ${baseClasses} ${borderClass}`}
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
};

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

  // Stato per il modale di benvenuto
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);

  // Controlla se mostrare il modale al primo accesso
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeenModal = localStorage.getItem("capibara-welcome-seen");
      if (!hasSeenModal) {
        setShowWelcomeModal(true);
      }
    }
  }, []);

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("capibara-welcome-seen", "true");
    }
  };

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
          isDark ? "border-r border-white/5 bg-zinc-900" : "border-r border-zinc-200 bg-white"
        }`}
      >
        <Link href="/" className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <Image
              src={isDark ? "/logo_capibara.png" : "/logo_capibara_nero.png"}
              alt="Capibara logo"
              width={80}
              height={80}
              className="h-20 w-20 rounded-2xl bg-white/5 object-contain p-2"
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
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    isDark
                      ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 text-black"
                  }`}
                >
                  Beta
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
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61584685405654"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition hover:opacity-70 ${
                    isDark ? "text-zinc-300" : "text-zinc-700"
                  }`}
                  aria-label="Facebook"
                >
                  <FacebookIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/capibara_coop?igsh=MWhlbWJ2M2o0djRyMA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition hover:opacity-70 ${
                    isDark ? "text-zinc-300" : "text-zinc-700"
                  }`}
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@capibara.media"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition hover:opacity-70 ${
                    isDark ? "text-zinc-300" : "text-zinc-700"
                  }`}
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              </div>
              <div className="flex gap-3">
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
              )}
              </div>
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

      {/* Modale di benvenuto */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          
          {/* Modale */}
          <div
            className={`relative z-10 w-full max-w-lg rounded-3xl border p-8 shadow-2xl ${
              isDark
                ? "border-white/10 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-900"
            }`}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Image
                  src={isDark ? "/logo_capibara.png" : "/logo_capibara_nero.png"}
                  alt="Capibara logo"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-2xl bg-white/5 object-contain p-2"
                  priority
                />
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">Capibara</h2>
                  <span className="rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
                    Beta
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Stiamo costruendo qualcosa di nuovo
                </h3>
                <p className="body-text-lg leading-relaxed">
                  Benvenuto su Capibara. Stiamo ancora lavorando al sito e stiamo testando
                  funzionalità, contenuti e design. Alcune cose potrebbero non funzionare
                  perfettamente o cambiare nel tempo.
                </p>
                <p className="body-text leading-relaxed">
                  Se vuoi darci un feedback o segnalare qualcosa che non va,{" "}
                  <a
                    href="#"
                    className="font-semibold underline hover:opacity-80"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCloseModal();
                    }}
                  >
                    contattaci
                  </a>
                  . Il tuo contributo ci aiuta a migliorare.
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className={`w-full rounded-full px-6 py-3 font-semibold transition-colors ${
                  isDark
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                Ho capito, continua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

