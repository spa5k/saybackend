import type { Post } from './content'
import type { MarkName } from '@/components/paper/Figure'

/** The marker colour a post gets on the home page calendar and in lists. */
export const postMarks: Array<{
  name: string
  mark: MarkName
  match: Array<string>
}> = [
  { name: 'Go', mark: 'lilac', match: ['golang', 'happycontext'] },
  { name: 'Postgres', mark: 'blue', match: ['postgres', 'uuid', 'pgrx'] },
  {
    name: 'Agents',
    mark: 'amber',
    match: ['ai', 'llm', 'claude', 'codex', 'agent', 'rag', 'prompt-caching'],
  },
  {
    name: 'Web',
    mark: 'sage',
    match: ['nextjs', 'next.js', 'react', 'zustand', 'electron'],
  },
]

export const otherMark = { name: 'Other', mark: 'sand' as MarkName }

export function markOf(post: Pick<Post, 'tags'>) {
  const tags = (post.tags ?? []).map((tag) => tag.toLowerCase())
  return (
    postMarks.find((entry) =>
      entry.match.some((term) =>
        tags.some((tag) => tag === term || tag.split(/[\s-]/).includes(term)),
      ),
    ) ?? otherMark
  )
}
