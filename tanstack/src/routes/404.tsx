import { createFileRoute } from '@tanstack/react-router'

import { NotFoundPage } from '@/components/NotFoundPage'
import { NOT_FOUND_META, seo } from '@/lib/site'

export const Route = createFileRoute('/404')({
  head: () =>
    seo({
      ...NOT_FOUND_META,
      noindex: true,
    }),
  component: NotFoundPage,
})
