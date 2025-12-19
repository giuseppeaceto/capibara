# Commit Message

```
feat: add Strapi SEO plugin integration

Install and configure @strapi/plugin-seo to enable SEO management
directly from the CMS admin panel.

- Install @strapi/plugin-seo package
- Configure plugin in config/plugins.ts
- Add SEO component types to TypeScript definitions
- Update API functions to populate SEO component (Article, Video, Podcast)
- Update frontend pages to use SEO metadata when available
- Add fallback logic: SEO data > existing fields > defaults
- Support preventIndexing flag for noindex/nofollow
- Create documentation: analysis and installation guide

The integration is backward compatible - existing content continues
to work without SEO fields. When SEO fields are filled in Strapi,
they take priority over default metadata generation.

Files modified:
- apps/cms/package.json (added @strapi/plugin-seo)
- apps/cms/config/plugins.ts (enabled SEO plugin)
- apps/web/src/lib/api.ts (added SEO types and populate)
- apps/web/src/app/articoli/[slug]/page.tsx (use SEO metadata)
- apps/web/src/app/video/[slug]/page.tsx (use SEO metadata)
- apps/web/src/app/podcast/[slug]/page.tsx (use SEO metadata)

Documentation:
- ANALISI_PLUGIN_SEO.md (SEO plugins analysis)
- INSTALLAZIONE_SEO_PLUGIN.md (installation guide)
```

