import MiniSearch from 'minisearch'
import type { Options, SearchResult } from 'minisearch'

import type { MarkName } from '@/components/paper/Figure'

/** One indexed part of a post: the text under one heading. */
export type SearchSection = {
  /** `slug#anchor`; the intro of a post has an empty anchor. */
  id: string
  slug: string
  anchor: string
  title: string
  heading: string
  text: string
  tags: string
  date: string
  mark: MarkName
}

type StoredSection = Omit<SearchSection, 'id' | 'tags'>

export const SEARCH_INDEX_PATH = '/search-index.json'

// Words too common to find a post with. Leaving them out makes the index smaller.
const STOP_WORDS = new Set(
  (
    'a an and are as at be but by can do does for from has have how i if in ' +
    'into is it its my no not of on or our so than that the their then there ' +
    'these they this to was we were what when where which who why will with ' +
    'you your'
  ).split(' '),
)

function processTerm(term: string) {
  const word = term.toLowerCase()
  return STOP_WORDS.has(word) ? null : word
}

/** The server and the browser must use the same options for one index. */
export const searchOptions: Options<SearchSection> = {
  fields: ['title', 'heading', 'text', 'tags'],
  processTerm,
  storeFields: ['slug', 'anchor', 'title', 'heading', 'text', 'date', 'mark'],
  searchOptions: {
    boost: { title: 4, heading: 2, tags: 2 },
    prefix: true,
    // One wrong letter from five letters, two from eight. Short words must be exact.
    fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
  },
}

let indexPromise: Promise<MiniSearch<SearchSection>> | undefined

/** Downloads the index once, the first time search opens. */
export function loadSearchIndex() {
  indexPromise ??= fetch(SEARCH_INDEX_PATH)
    .then((response) => {
      if (!response.ok) throw new Error(`Search index: ${response.status}`)
      return response.text()
    })
    .then((json) => MiniSearch.loadJSON<SearchSection>(json, searchOptions))
  indexPromise.catch(() => {
    indexPromise = undefined
  })
  return indexPromise
}

export type SearchHit = StoredSection & {
  score: number
  terms: Array<string>
}

export type PostHits = {
  slug: string
  title: string
  date: string
  mark: MarkName
  sections: Array<SearchHit>
}

const SECTIONS_PER_POST = 3

/**
 * All words must match. When no section has all of them, any word may
 * match, so a typo in one word does not empty the list.
 */
export function searchPosts(index: MiniSearch<SearchSection>, query: string) {
  let results = index.search(query, { combineWith: 'AND' })
  if (results.length === 0) results = index.search(query)
  return groupByPost(results as Array<SearchResult & StoredSection>)
}

function groupByPost(results: Array<SearchResult & StoredSection>) {
  const posts = new Map<string, PostHits>()
  for (const result of results) {
    let post = posts.get(result.slug)
    if (!post) {
      post = {
        slug: result.slug,
        title: result.title,
        date: result.date,
        mark: result.mark,
        sections: [],
      }
      posts.set(result.slug, post)
    }
    if (post.sections.length < SECTIONS_PER_POST) {
      post.sections.push({
        slug: result.slug,
        anchor: result.anchor,
        title: result.title,
        heading: result.heading,
        text: result.text,
        date: result.date,
        mark: result.mark,
        score: result.score,
        terms: result.terms,
      })
    }
  }
  return [...posts.values()]
}

export type ExcerptPart = { text: string; match: boolean }

/** A short window of `text` round the first matched word, matches marked. */
export function excerpt(text: string, terms: Array<string>, width = 180) {
  const words = terms
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (words.length === 0) return [{ text: clip(text, 0, width), match: false }]
  const pattern = new RegExp(`\\b(?:${words.join('|')})\\w*`, 'gi')

  const first = text.search(pattern)
  const start = Math.max(0, first - Math.round(width / 3))
  const window = clip(text, start, width)

  const parts: Array<ExcerptPart> = []
  let last = 0
  for (const match of window.matchAll(pattern)) {
    const index = match.index
    if (index > last)
      parts.push({ text: window.slice(last, index), match: false })
    parts.push({ text: match[0], match: true })
    last = index + match[0].length
  }
  if (last < window.length)
    parts.push({ text: window.slice(last), match: false })
  return parts
}

function clip(text: string, start: number, width: number) {
  let from = start
  if (from > 0) {
    const space = text.indexOf(' ', from)
    from = space === -1 ? from : space + 1
  }
  let to = Math.min(text.length, from + width)
  if (to < text.length) {
    const space = text.lastIndexOf(' ', to)
    to = space > from ? space : to
  }
  return `${from > 0 ? '… ' : ''}${text.slice(from, to)}${to < text.length ? ' …' : ''}`
}
