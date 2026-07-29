import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <section className="page-frame simple-page not-found">
      <p className="eyebrow">404</p>
      <h1>That page wandered off.</h1>
      <p>
        The address may have changed, or the page may no longer exist. The
        archive is the best place to pick up the trail.
      </p>
      <Link className="text-link" to="/blog">
        Browse the blog →
      </Link>
    </section>
  )
}
