import { Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'

import { MARKS } from './Figure'
import { MiniMotif } from './Motifs'
import { formatDate } from '@/lib/content'
import type { Post } from '@/lib/content'
import { heroOf } from '@/lib/heroes'
import { markOf } from '@/lib/marks'

const NEW_FOR_DAYS = 45

/** Titles and dates only: one marker square, one line, per post. */
export function PostList({
  posts,
  flagNewest = false,
  motifs = false,
}: {
  posts: Array<Post>
  flagNewest?: boolean
  /** Show the small drawing of each post's subject. */
  motifs?: boolean
}) {
  return (
    <ul className={motifs ? 'post-list post-list-motifs' : 'post-list'}>
      {posts.map((post, index) => {
        const isNew =
          flagNewest &&
          index === 0 &&
          Date.now() - Date.parse(post.date) < NEW_FOR_DAYS * 86_400_000
        return (
          <li key={post.slug}>
            <Link
              to="/blog/$slug/"
              params={{ slug: post.slug }}
              reloadDocument
              style={{ '--mark': MARKS[markOf(post).mark] } as CSSProperties}
            >
              <span className="mark-square" aria-hidden="true" />
              <span>
                <span className="post-list-title">{post.title}</span>
                {isNew ? (
                  <span className="hand" suppressHydrationWarning>
                    new!
                  </span>
                ) : null}
              </span>
              {motifs ? <MiniMotif name={heroOf(post).name} /> : null}
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
