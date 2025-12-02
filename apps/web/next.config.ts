import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurazione immagini remote (Strapi CMS + Cloudinary)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "capibara-1z0m.onrender.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
