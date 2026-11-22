import { createFileRoute } from '@tanstack/react-router'

import { buildSearchIndex } from '@/lib/searchIndex.server'

export const Route = createFileRoute('/search-index.json')({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(buildSearchIndex()), {
          headers: {
            'Cache-Control':
              'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
            'Content-Type': 'application/json; charset=utf-8',
            'X-Robots-Tag': 'noindex',
          },
        }),
    },
  },
})
