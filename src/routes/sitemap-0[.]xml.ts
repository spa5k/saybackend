import { createFileRoute } from '@tanstack/react-router'

import { posts, projects } from '@/lib/content'
import { guides } from '@/lib/guides'
import { SITE } from '@/lib/site'
import { postsForTopic, topicCards } from '@/lib/topics'

export const Route = createFileRoute('/sitemap-0.xml')({
  server: {
    handlers: {
      GET: async () => {
        const newest = (dates: Array<string | undefined>) =>
          dates
            .filter((date): date is string => Boolean(date))
            .sort((a, b) => Date.parse(b) - Date.parse(a))[0]
        const postsLastmod = newest(posts.map((p) => p.updated ?? p.date))
        const projectsLastmod = newest(projects.map((p) => p.updated ?? p.date))
        const urls: Array<{ path: string; lastmod?: string }> = [
          { path: '/', lastmod: newest([postsLastmod, projectsLastmod]) },
          { path: '/about/' },
          { path: '/blog/', lastmod: postsLastmod },
          { path: '/hiring/' },
          { path: '/projects/', lastmod: projectsLastmod },
          { path: '/topics/', lastmod: postsLastmod },
          ...posts.map((post) => ({
            path: `${post.href}/`,
            lastmod: post.updated ?? post.date,
          })),
          ...projects.map((project) => ({
            path: `${project.href}/`,
            lastmod: project.updated ?? project.date,
          })),
          ...(guides.length
            ? [
                {
                  path: '/guides/',
                  lastmod: newest(guides.map((guide) => guide.updated_at)),
                },
              ]
            : []),
          ...guides.map((guide) => ({
            path: `${guide.href}/`,
            lastmod: guide.updated_at,
          })),
          ...topicCards().map((topic) => ({
            path: `/topics/${topic.slug}/`,
            lastmod: newest(
              postsForTopic(topic).map((post) => post.updated ?? post.date),
            ),
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
