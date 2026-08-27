import { createFileRoute } from '@tanstack/react-router'

import { legacyPostRedirects } from '@/lib/content'
import { getBlogMarkdown, markdownResponse } from '@/lib/markdown.server'

export const Route = createFileRoute('/blog/{$slug}.md')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const destination = legacyPostRedirects[params.slug]
        if (destination) {
          return Response.redirect(
            new URL(`${destination}.md`, request.url).href,
            301,
          )
        }

        return markdownResponse(getBlogMarkdown(params.slug))
      },
    },
  },
})
