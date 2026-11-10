import type { Article } from 'outrank-next-js-blog'

// Written by scripts/sync-outrank.mjs. The glob returns nothing when the file
// has not been synced yet, so a fresh clone still builds.
const synced = import.meta.glob<Array<Article>>(
  '../data/outrank/articles.json',
  {
    eager: true,
    import: 'default',
  },
)

export type Guide = Article & { href: string }

export const guides: Array<Guide> = (Object.values(synced)[0] ?? []).map(
  (article) => ({ ...article, href: `/guides/${article.slug}` }),
)

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug)
}
