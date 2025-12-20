import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
        url: "/logo_capibara.png",
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
    images: ["/logo_capibara.png"],
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('capibara-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
