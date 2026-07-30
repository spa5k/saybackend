import { createFileRoute } from '@tanstack/react-router'

import { posts, projects } from '@/lib/content'
import { SITE } from '@/lib/site'

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export const Route = createFileRoute('/rss.xml')({
  server: {
    handlers: {
      GET: async () => {
        const items = [...posts, ...projects].sort(
          (a, b) => Date.parse(b.date) - Date.parse(a.date),
        )
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <description>${escapeXml(SITE.description)}</description>
    <link>${SITE.origin}/</link>
    ${items
      .map(
        (item) => `<item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <link>${SITE.origin}${item.href}/</link>
      <guid>${SITE.origin}${item.href}/</guid>
    </item>`,
      )
      .join('\n    ')}
  </channel>
</rss>`
        return new Response(xml, {
          headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
        })
      },
    },
  },
})
