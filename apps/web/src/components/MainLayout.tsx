"use client";

import React from "react";
import {
  Archive,
  BadgeEuro,
  CalendarDays,
  GraduationCap,
  Headphones,
  Home as HomeIcon,
  Lock,
  Mail,
  Map,
  PlayCircle,
  Star,
  Sun,
  Moon,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  FileSignature,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import NewsTicker, { type TickerItem } from "@/components/NewsTicker";

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

// Header styles con gradiente pastel red, usato in una barra "floating"
// Fluent Design: maggiore trasparenza con effetto glassmorphism
const getHeaderStyles = (isDark: boolean) => {
  // Solo stile dell'header; il posizionamento (fixed) è gestito dal wrapper esterno.
  const baseClasses =
    "flex flex-col gap-6 w-full py-6 " +
    "rounded-3xl border backdrop-blur-xl border-white/10";

  if (isDark) {
    // Dark mode: pastel red trasparente con gradiente fluente e glassmorphism
    return {
      className: baseClasses,
      style: {
        background: "linear-gradient(135deg, rgba(248, 113, 113, 0.7) 0%, rgba(251, 146, 60, 0.65) 100%)", // red-400 to orange-400 gradient con maggiore trasparenza
        boxShadow: "0 8px 32px 0 rgba(248, 113, 113, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 1px 0 0 rgba(255, 255, 255, 0.1) inset",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      },
    };
  }
  // Light mode: gradiente trasparente con effetto glassmorphism
  return {
    className: `${baseClasses}`,
    style: {
      background: "linear-gradient(135deg, rgba(248, 113, 113, 0.75) 0%, rgba(251, 146, 60, 0.7) 100%)", // red-400 to orange-400 gradient con trasparenza
      boxShadow: "0 8px 32px 0 rgba(248, 113, 113, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.2) inset, 0 1px 0 0 rgba(255, 255, 255, 0.3) inset",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
    },
  };
};

const primaryNav: NavLink[] = [
  { label: "Home", icon: HomeIcon, href: "/" },
  {
    label: "Newsroom",
    icon: Mail,
    href: "/newsroom",
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
    label: "Eventi", 
    icon: CalendarDays, 
    href: "/eventi",
    color: "bg-emerald-500/20 border-emerald-500/50 text-white",
    colorLight: "bg-emerald-100 border-emerald-500 text-emerald-900"
  },
  { 
    label: "Petizioni", 
    icon: FileSignature, 
    href: "/petizioni",
    color: "bg-orange-500/20 border-orange-500/50 text-white",
    colorLight: "bg-orange-100 border-orange-500 text-orange-900"
  },
  {
    label: "Corsi",
    icon: GraduationCap,
    href: "/corsi",
    color: "bg-amber-500/20 border-amber-500/50 text-white",
    colorLight: "bg-amber-100 border-amber-500 text-amber-900"
  },
  {
    label: "Mappa dei conflitti",
    icon: Map,
    href: "/conflitti",
    color: "bg-red-500/20 border-red-500/50 text-white",
    colorLight: "bg-red-100 border-red-500 text-red-900"
  },
  { label: "Contenuti Extra", icon: Star, href: "/extra", locked: true },
];

const utilityNav: NavLink[] = [
  { label: "Chi siamo", icon: CapibaraLogoIcon, href: "/chi-siamo" },
  { label: "Abbonamenti", icon: BadgeEuro, href: "/abbonamenti" },
  { label: "Archivio", icon: Archive, href: "/archivio" },
];

const NavGroup = ({
  title,
  links,
  currentPath,
  isDark,
  onLinkClick,
  isCollapsed = false,
}: {
  title?: string;
  links: NavLink[];
  currentPath: string;
  isDark: boolean;
  onLinkClick?: () => void;
  isCollapsed?: boolean;
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
      {title && !isCollapsed && (
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
          ? "text-black"
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
          onClick={onLinkClick}
          className={`group relative flex flex-col rounded-2xl ${isCollapsed ? 'px-2 py-3 items-center' : 'px-3 py-2'} text-sm transition ${baseClasses} ${borderClass}`}
          title={isCollapsed ? item.label : undefined}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            {item.icon === CapibaraLogoIcon ? (
              <CapibaraLogoIcon
                className={`h-4 w-4 ${iconClasses}`}
                isDark={isDark}
                isActive={isActive}
              />
            ) : (
              <item.icon className={`h-4 w-4 ${iconClasses}`} />
            )}
            {!isCollapsed && (
              <>
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
              </>
            )}
          </div>

          {/* Tooltip per sidebar collassata */}
          {isCollapsed && (
            <div className={`absolute left-full ml-2 px-2 py-1 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${
              isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-white'
            }`}>
              {item.label}
              <div className={`absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent ${
                isDark ? 'border-r-zinc-800' : 'border-r-zinc-900'
              }`} />
            </div>
          )}
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
  tickerItems,
}: {
  children: React.ReactNode;
  tickerItems?: TickerItem[];
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Tema: usa sempre "dark" come valore iniziale sia su server che su client
  // per evitare mismatch di idratazione; poi sincronizza con localStorage dopo il mount.
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  // Al mount, leggi il tema salvato (se presente) e applicalo
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTheme = localStorage.getItem("capibara-theme") as
      | "dark"
      | "light"
      | null;
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    }
  // esegui solo al mount; eslint può essere ignorato se segnala theme nelle deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salva il tema nel localStorage e applica all'elemento html quando cambia
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("capibara-theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
      // Aggiungi/rimuovi classe 'dark' per Tailwind dark: variant
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  // Stato per il modale di benvenuto
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);

  // Stato per il menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Stato per la sidebar collassabile (solo desktop)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Controlla se mostrare il modale al primo accesso
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeenModal = localStorage.getItem("capibara-welcome-seen");
      if (!hasSeenModal) {
        setShowWelcomeModal(true);
      }
    }
  }, []);

  // Carica lo stato della sidebar dal localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCollapsed = localStorage.getItem("capibara-sidebar-collapsed");
    if (savedCollapsed) {
      setIsSidebarCollapsed(savedCollapsed === "true");
    }
  }, []);

  // Salva lo stato della sidebar nel localStorage quando cambia
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("capibara-sidebar-collapsed", isSidebarCollapsed.toString());
    }
  }, [isSidebarCollapsed]);

  // Chiudi il menu mobile quando si naviga
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Previeni lo scroll del body quando il menu mobile è aperto
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

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
        className={`sticky top-0 hidden h-screen flex-shrink-0 flex-col ${isSidebarCollapsed ? 'px-2 py-6' : 'px-4 py-6'} lg:flex transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-16" : "w-72"
        } ${
          isDark ? "border-r border-white/5 bg-zinc-900" : "border-r border-zinc-200 bg-white"
        }`}
      >
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'}`}>
          <Link href="/" className={`${isSidebarCollapsed ? '' : 'flex-1'}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'gap-0' : 'gap-3'}`}>
              <Image
                src={isDark ? "/logo_capibara.png" : "/logo_capibara_nero.png"}
                alt="Capibara logo"
                width={isSidebarCollapsed ? 48 : 80}
                height={isSidebarCollapsed ? 36 : 60}
                className={`${isSidebarCollapsed ? 'h-9 w-12' : 'h-15 w-20'} ${isSidebarCollapsed ? 'rounded-md' : 'rounded-2xl'} bg-white/5 object-contain ${isSidebarCollapsed ? 'p-1' : 'p-2'}`}
                style={{
                  filter: isDark 
                    ? 'brightness(1.1) saturate(1.2) hue-rotate(-5deg)' 
                    : 'brightness(0.95) saturate(1.1) hue-rotate(-5deg)'
                }}
                priority
              />
              {!isSidebarCollapsed && (
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
              )}
            </div>
          </Link>
        </div>
        <div className="mt-8 flex-1 space-y-8 overflow-y-auto">
          <NavGroup links={primaryNav} currentPath={pathname} isDark={isDark} isCollapsed={isSidebarCollapsed} />
          <NavGroup
            title="Community"
            links={utilityNav}
            currentPath={pathname}
            isDark={isDark}
            isCollapsed={isSidebarCollapsed}
          />
        </div>

        {/* Social Links */}
        <div className={`mt-6 border-t ${isDark ? "border-white/5" : "border-zinc-200"} pt-4`}>
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61584685405654"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition ${
                  isDark
                    ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
                aria-label="Facebook"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/capibara_coop?igsh=MWhlbWJ2M2o0djRyMA=="
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition ${
                  isDark
                    ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@capibara.media"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition ${
                  isDark
                    ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61584685405654"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition ${
                    isDark
                      ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                  aria-label="Facebook"
                >
                  <FacebookIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/capibara_coop?igsh=MWhlbWJ2M2o0djRyMA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition ${
                    isDark
                      ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@capibara.media"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition ${
                    isDark
                      ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {!isSidebarCollapsed && (
          <div className="mt-4 border-t border-white/5 pt-4 text-xs text-zinc-500">
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-3 flex-1">
                <p className="flex flex-wrap gap-2">
                  <Link href="/chi-siamo/redazione" className="hover:text-zinc-300">Redazione</Link>
                  <span>•</span>
                  <Link href="/partner" className="hover:text-zinc-300">Partner</Link>
                  <span>•</span>
                  <Link href="/tecnologia" className="hover:text-zinc-300">Tecnologia</Link>
                </p>
                <p className="flex flex-wrap gap-2">
                  <Link href="/privacy" className="hover:text-zinc-300">
                    Privacy
                  </Link>
                  <span>•</span>
                  <Link href="/termini" className="hover:text-zinc-300">
                    Termini
                  </Link>
                  <span>•</span>
                  <span>Contattaci</span>
                </p>
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition ml-4 ${
                  isDark
                    ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
                aria-label="Collassa sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Pulsante toggle per sidebar collassata */}
        {isSidebarCollapsed && (
          <div className="mt-auto px-0 pb-4">
            <div className="flex justify-center">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
                  isDark
                    ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
                aria-label="Espandi sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <aside
            className={`fixed left-0 top-0 z-50 h-full w-80 flex-shrink-0 flex-col px-4 py-6 overflow-y-auto lg:hidden animate-in slide-in-from-left duration-300 ${
              isDark ? "border-r border-white/5 bg-zinc-900" : "border-r border-zinc-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <Image
                  src={isDark ? "/logo_capibara.png" : "/logo_capibara_nero.png"}
                  alt="Capibara logo"
                  width={60}
                  height={60}
                  className="h-16 w-16 rounded-2xl bg-white/5 object-contain p-2"
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
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-2 rounded-xl transition ${
                  isDark
                    ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
                aria-label="Chiudi menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-8">
              <NavGroup
                links={primaryNav}
                currentPath={pathname}
                isDark={isDark}
                onLinkClick={() => setIsMobileMenuOpen(false)}
                isCollapsed={false}
              />
              <NavGroup
                title="Community"
                links={utilityNav}
                currentPath={pathname}
                isDark={isDark}
                onLinkClick={() => setIsMobileMenuOpen(false)}
                isCollapsed={false}
              />
            </div>
            {/* Social Links Mobile */}
            <div className={`mt-8 border-t ${isDark ? "border-white/5" : "border-zinc-200"} pt-4`}>
              <div className="flex items-center gap-3 mb-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61584685405654"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition ${
                    isDark
                      ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                  aria-label="Facebook"
                >
                  <FacebookIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/capibara_coop?igsh=MWhlbWJ2M2o0djRyMA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition ${
                    isDark
                      ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@capibara.media"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition ${
                    isDark
                      ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="mt-4 space-y-3 border-t border-white/5 pt-4 text-xs text-zinc-500">
              <p className="flex flex-wrap gap-2">
                <Link href="/chi-siamo/redazione" className="hover:text-zinc-300" onClick={() => setIsMobileMenuOpen(false)}>Redazione</Link>
                <span>•</span>
                <Link href="/partner" className="hover:text-zinc-300" onClick={() => setIsMobileMenuOpen(false)}>Partner</Link>
                <span>•</span>
                <Link href="/tecnologia" className="hover:text-zinc-300" onClick={() => setIsMobileMenuOpen(false)}>Tecnologia</Link>
              </p>
              <p className="flex flex-wrap gap-2">
                <Link href="/privacy" className="hover:text-zinc-300" onClick={() => setIsMobileMenuOpen(false)}>
                  Privacy
                </Link>
                <span>•</span>
                <Link href="/termini" className="hover:text-zinc-300" onClick={() => setIsMobileMenuOpen(false)}>
                  Termini
                </Link>
                <span>•</span>
                <span>Contattaci</span>
              </p>
            </div>
          </aside>
        </>
      )}

      <div className="flex-1">
        {/* HEADER FLOATING FIXED */}
        <div className={`pointer-events-none fixed top-4 z-40 ${isSidebarCollapsed ? 'left-16 lg:left-16' : 'left-0 lg:left-72'} right-0`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-24">
            <div
              className={getHeaderStyles(isDark).className}
              style={getHeaderStyles(isDark).style}
            >
              {/* Padding interno per distanziare gli elementi dal bordo arrotondato */}
              <div className="w-full px-4 sm:px-6 lg:px-8 pointer-events-auto">
          <div className="flex items-center justify-between w-full gap-2 min-w-0">
            {/* Lato sinistro: Logo e hamburger su mobile, Mappa conflitti su desktop */}
            <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
              {/* Logo e bottone hamburger per mobile - solo su mobile */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition flex-shrink-0 ${
                    isDark
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  }`}
                  aria-label="Apri menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
                <Link href="/" className="flex items-center gap-1.5 min-w-0">
                  <Image
                    src={isDark ? "/logo_capibara.png" : "/logo_capibara_nero.png"}
                    alt="Capibara logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-lg bg-white/5 object-contain p-1 flex-shrink-0"
                    priority
                  />
                  <span className={`text-sm sm:text-base font-semibold tracking-wide truncate ${
                    isDark ? "text-black" : "text-zinc-900"
                  }`}>
                    Capibara
                  </span>
                </Link>
              </div>
              {/* Link Mappa dei Conflitti - solo desktop */}
              <Link
                href="/conflitti"
                className={`hidden lg:flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  isDark
                    ? "border border-black/30 text-black hover:border-black/70"
                    : "border border-zinc-300 text-zinc-900 hover:border-zinc-900"
                }`}
              >
                <Map className="h-4 w-4" />
                <span>Mappa dei conflitti</span>
              </Link>
            </div>
            
            {/* Lato destro: Pulsanti e Dark Mode */}
            <div className="flex items-center gap-2 sm:gap-4 text-sm flex-shrink-0 min-w-0">
              {/* Pulsanti Abbonati ora e Accedi */}
              {!session && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    href="/abbonamenti"
                    className={`hidden sm:inline-flex rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                      isDark
                        ? "bg-white/90 text-black hover:bg-white"
                        : "bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                  >
                    Abbonati ora
                  </Link>
                  <Link
                    href="/login"
                    className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                      isDark
                        ? "border border-black/30 text-black hover:border-black/70"
                        : "border border-zinc-300 text-zinc-900 hover:border-zinc-900"
                    }`}
                  >
                    Accedi
                  </Link>
                </div>
              )}
              <div className="flex gap-1.5 sm:gap-3">
              {session ? (
                <>
                  <span
                    className={`hidden sm:inline ${
                      isDark ? "text-black" : "text-zinc-700"
                    }`}
                  >
                    Ciao, {session.user?.name ?? "utente"}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition whitespace-nowrap ${
                      isDark
                        ? "border border-black/30 text-black hover:border-black/60 hover:text-black"
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
                  className={`flex items-center gap-1 sm:gap-2 rounded-full px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition flex-shrink-0 ${
                    isDark
                      ? "border border-black/30 bg-white/20 text-black hover:border-black/60 hover:bg-white/30"
                      : "border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900 hover:text-zinc-900"
                  }`}
                  aria-label={isDark ? "Passa a light mode" : "Passa a dark mode"}
                >
                  {isDark ? (
                    <>
                      <Moon className="h-4 w-4" />
                      <span className="hidden sm:inline">Dark</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span className="hidden sm:inline">Light</span>
                    </>
                  )}
                </button>
              )}
              </div>
            </div>
            </div>
              </div>
            </div>
          </div>
        </div>

        {/* TICKER STRIP — fixed sotto l'header, nascosto su mobile */}
        {tickerItems && tickerItems.length > 0 && (
          <div className={`pointer-events-none fixed top-[7.5rem] z-30 hidden sm:block ${isSidebarCollapsed ? 'left-16 lg:left-16' : 'left-0 lg:left-72'} right-0`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-24">
              <NewsTicker items={tickerItems} isDark={isDark} />
            </div>
          </div>
        )}

        {/* SPACER: altezza ~ header + ticker */}
        <div className={`${tickerItems && tickerItems.length > 0 ? 'h-40 sm:h-48 lg:h-52' : 'h-32 sm:h-36 lg:h-40'}`} />

        {/* Contenuto principale, allineato al container dell'header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-24">
          <main className="flex flex-col gap-10 pb-10">
            {children}
          </main>
        </div>
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

