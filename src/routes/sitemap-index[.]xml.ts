import { createFileRoute } from '@tanstack/react-router'

import { SITE } from '@/lib/site'

export const Route = createFileRoute('/sitemap-index.xml')({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE.origin}/sitemap-0.xml</loc></sitemap>
</sitemapindex>`,
          { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
        ),
    },
  },
})
