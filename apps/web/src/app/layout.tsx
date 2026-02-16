import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Capibara - Storie da chi non ha potere",
    template: "%s | Capibara",
  },
  description:
    "Capibara è una media company indipendente: video, podcast, articoli e newsletter per raccontare lavoro, diritti, conflitti sociali e nuove forme di organizzazione.",
  keywords: [
    "media indipendente",
    "giornalismo",
    "video",
    "podcast",
    "newsletter",
    "lavoro",
    "diritti",
    "conflitti sociali",
    "organizzazione",
  ],
  authors: [{ name: "Capibara" }],
  creator: "Capibara",
  publisher: "Capibara",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo_capibara.png",
    shortcut: "/logo_capibara.png",
    apple: "/logo_capibara.png",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: "Capibara",
    title: "Capibara - Storie da chi non ha potere",
    description:
      "Capibara è una media company indipendente: video, podcast, articoli e newsletter per raccontare lavoro, diritti, conflitti sociali e nuove forme di organizzazione.",
    images: [
      {
        url: new URL("/logo_capibara.png", process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media").toString(),
        width: 1200,
        height: 630,
        alt: "Capibara Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Capibara - Storie da chi non ha potere",
    description:
      "Capibara è una media company indipendente: video, podcast, articoli e newsletter per raccontare lavoro, diritti, conflitti sociali e nuove forme di organizzazione.",
    images: [new URL("/logo_capibara.png", process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media").toString()],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_FACEBOOK_APP_ID && (
          <meta property="fb:app_id" content={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID} key="fb-app-id" />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('capibara-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  // Aggiungi classe 'dark' per Tailwind dark: variant
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
