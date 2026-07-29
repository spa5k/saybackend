import { createFileRoute } from '@tanstack/react-router'

import { seo } from '@/lib/site'

export const Route = createFileRoute('/404')({
  head: () =>
    seo({
      title: '404 — Not Found',
      description: 'The page you are looking for does not exist.',
      path: '/404',
      noindex: true,
    }),
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <section className="page-frame simple-page not-found">
      <p className="eyebrow">404</p>
      <h1>That page wandered off.</h1>
      <p>
        The address may have changed, or the page may no longer exist. The
        archive is the best place to pick up the trail.
      </p>
      <a className="text-link" href="/blog">
        Browse the blog →
      </a>
    </section>
  )
}
