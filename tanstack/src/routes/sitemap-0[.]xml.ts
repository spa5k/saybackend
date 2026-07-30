import { createFileRoute } from '@tanstack/react-router'

import { posts, projects } from '@/lib/content'
import { SITE } from '@/lib/site'
import { topicCards } from '@/lib/topics'

export const Route = createFileRoute('/sitemap-0.xml')({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = [
          '/',
          '/about/',
          '/blog/',
          '/hiring/',
          '/projects/',
          '/topics/',
        ]
        const urls: Array<{ path: string; lastmod?: string }> = [
          ...staticPaths.map((path) => ({ path })),
          ...posts.map((post) => ({
            path: `${post.href}/`,
            lastmod: post.updated ?? post.date,
          })),
          ...projects.map((project) => ({
            path: `${project.href}/`,
            lastmod: project.updated ?? project.date,
          })),
          ...topicCards().map((topic) => ({
            path: `/topics/${topic.slug}/`,
          })),
        ]
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, lastmod }) => `  <url>
    <loc>${new URL(path, SITE.origin).href}</loc>${
      lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''
    }
  </url>`,
  )
  .join('\n')}
</urlset>`
        return new Response(xml, {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        })
      },
    },
  },
})
