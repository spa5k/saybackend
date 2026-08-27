import { createFileRoute } from '@tanstack/react-router'

import { getProjectMarkdown, markdownResponse } from '@/lib/markdown.server'

export const Route = createFileRoute('/projects/{$slug}.md')({
  server: {
    handlers: {
      GET: async ({ params }) =>
        markdownResponse(getProjectMarkdown(params.slug)),
    },
  },
})
