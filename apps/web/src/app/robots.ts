import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://capibara.media";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

