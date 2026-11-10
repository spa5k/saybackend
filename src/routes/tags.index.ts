import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * The tags index was retired together with tag archives. Consolidate any
 * remaining links to the blog archive.
 */
export const Route = createFileRoute('/tags/')({
  beforeLoad: () => {
    throw redirect({ href: '/blog/', statusCode: 301 })
  },
})
