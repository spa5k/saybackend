import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { SearchBox } from '@/components/SearchBox'
import { PAGE_META, seo } from '@/lib/site'

export const Route = createFileRoute('/search')({
  head: () =>
    seo({
      title: `Search - ${PAGE_META.home.title}`,
      description: 'Search the SayBackend posts.',
      path: '/search',
      noindex: true,
    }),
  component: SearchPage,
})

function SearchPage() {
  // The page is prerendered without a query; read `?q=` in the browser.
  const [query, setQuery] = useState<string>()

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get('q') ?? '')
  }, [])

  return (
    <section className="page-frame search-page">
      <header className="page-heading">
        <p className="eyebrow">Search</p>
        <h1>Find a post.</h1>
        <p>Search the titles, headings and text of every published post.</p>
      </header>
      {query === undefined ? null : <SearchBox initialQuery={query} />}
    </section>
  )
}
