import type MiniSearch from 'minisearch'
import { useDeferredValue, useEffect, useId, useMemo, useState } from 'react'
import type { CSSProperties, Ref } from 'react'

import { MARKS } from './paper/Figure'
import { formatDate } from '@/lib/content'
import { excerpt, loadSearchIndex, searchPosts } from '@/lib/search'
import type { SearchSection } from '@/lib/search'

type Status = 'idle' | 'loading' | 'ready' | 'failed'

const MAX_POSTS = 12

/** Search input and grouped results. Loads the index on first use. */
export function SearchBox({
  initialQuery = '',
  inputRef,
  onNavigate,
}: {
  initialQuery?: string
  inputRef?: Ref<HTMLInputElement>
  onNavigate?: () => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const [index, setIndex] = useState<MiniSearch<SearchSection>>()
  const [status, setStatus] = useState<Status>('idle')
  const deferredQuery = useDeferredValue(query.trim())
  const resultsId = useId()

  useEffect(() => {
    let active = true
    setStatus('loading')
    loadSearchIndex()
      .then((loaded) => {
        if (!active) return
        setIndex(loaded)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('failed')
      })
    return () => {
      active = false
    }
  }, [])

  const results = useMemo(
    () =>
      index && deferredQuery.length > 1
        ? searchPosts(index, deferredQuery).slice(0, MAX_POSTS)
        : [],
    [index, deferredQuery],
  )

  return (
    <div className="search-box">
      <input
        ref={inputRef}
        className="search-input"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search the posts"
        aria-label="Search the posts"
        aria-controls={resultsId}
        autoComplete="off"
        spellCheck={false}
      />
      <div id={resultsId} className="search-results" aria-live="polite">
        {status === 'failed' ? (
          <p className="search-note">
            Search could not load. Refresh the page and try again.
          </p>
        ) : status === 'loading' && deferredQuery ? (
          <p className="search-note">Loading the index…</p>
        ) : deferredQuery.length > 1 && results.length === 0 ? (
          <p className="search-note">No post matches “{deferredQuery}”.</p>
        ) : results.length > 0 ? (
          <ol className="search-list">
            {results.map((post) => (
              <li
                key={post.slug}
                style={{ '--mark': MARKS[post.mark] } as CSSProperties}
              >
                <a
                  className="search-post"
                  href={`/blog/${post.slug}/`}
                  onClick={onNavigate}
                >
                  <span className="mark-square" aria-hidden="true" />
                  <span className="search-post-title">{post.title}</span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </a>
                <ul className="search-sections">
                  {post.sections.map((section) => (
                    <li key={section.anchor || 'intro'}>
                      <a
                        href={`/blog/${post.slug}/${section.anchor ? `#${section.anchor}` : ''}`}
                        onClick={onNavigate}
                      >
                        {section.heading ? (
                          <span className="search-heading">
                            {section.heading}
                          </span>
                        ) : null}
                        <span className="search-excerpt">
                          {excerpt(section.text, section.terms).map(
                            (part, position) =>
                              part.match ? (
                                <mark key={position}>{part.text}</mark>
                              ) : (
                                <span key={position}>{part.text}</span>
                              ),
                          )}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>
  )
}
