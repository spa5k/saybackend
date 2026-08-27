import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { mountPagefind } from '@/lib/pagefind'
import { PAGE_META, seo } from '@/lib/site'

export const Route = createFileRoute('/pagefind')({
  head: () =>
    seo({
      title: `Search - ${PAGE_META.home.title}`,
      description: 'Search the SayBackend article archive.',
      path: '/pagefind',
      noindex: true,
    }),
  component: SearchPage,
})

function SearchPage() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const searchContainer = container.current
    if (!searchContainer) return

    void mountPagefind(searchContainer)
      .then(() => {
        const query = new URLSearchParams(window.location.search).get('q')
        if (!query) return
        const input = searchContainer.querySelector<HTMLInputElement>(
          '.pagefind-ui__search-input',
        )
        if (!input) return
        input.value = query
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })
      .catch(() => {
        searchContainer.textContent =
          'Search could not load. Please refresh and try again.'
      })
  }, [])

  return (
    <section className="page-frame search-page">
      <header className="page-heading">
        <p className="eyebrow">Search</p>
        <h1>Find a note from the archive.</h1>
        <p>Search across articles, build logs, projects, and field notes.</p>
      </header>
      <div ref={container} />
    </section>
  )
}
