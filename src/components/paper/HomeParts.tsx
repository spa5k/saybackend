import { Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'

import { MARKS } from './Figure'
import { Motif } from './Motifs'
import type { MotifName } from './Motifs'
import { formatDate } from '@/lib/content'
import type { Post } from '@/lib/content'
import { heroOf } from '@/lib/heroes'
import { markOf } from '@/lib/marks'

const markColor = (post: Post) => MARKS[markOf(post).mark]

/** The part of each hero drawing that holds the shapes, for a tile. */
const TILE_VIEW: Record<MotifName, string> = {
  ranks: '620 16 600 270',
  bars: '680 40 566 240',
  chain: '590 20 584 200',
  day: '570 20 668 220',
  lanes: '600 30 480 220',
  pipeline: '594 0 662 240',
  bands: '706 20 548 250',
  bits: '640 40 560 200',
  layers: '630 20 580 236',
  squares: '660 20 560 320',
  blocks: '650 30 620 320',
}

/** One tile per post: the drawing of its subject, then the title. */
export function PostTiles({ posts }: { posts: Array<Post> }) {
  return (
    <ul className="post-tiles">
      {posts.map((post) => {
        const { paper: _paper, ...drawing } = heroOf(post)
        return (
          <li key={post.slug}>
            <Link
              to="/blog/$slug/"
              params={{ slug: post.slug }}
              reloadDocument
              style={{ '--mark': markColor(post) } as CSSProperties}
            >
              <svg
                className="post-tile-art"
                viewBox={TILE_VIEW[drawing.name]}
                aria-hidden="true"
              >
                <Motif {...drawing} />
              </svg>
              <span className="post-list-title">{post.title}</span>
              <span className="post-tile-meta">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {' · '}
                {markOf(post).name}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

const WIDTH = 1000
const LEFT = 20
const RIGHT = 60
const LINE_Y = 96
const SIZE = 15

/**
 * All posts on one drawn line, by date. One square per post, in the colour
 * of its subject. Posts close in time stack upward.
 */
export function PostTimeline({ posts }: { posts: Array<Post> }) {
  const byDate = [...posts].sort(
    (a, b) => Date.parse(a.date) - Date.parse(b.date),
  )
  const firstYear = new Date(byDate[0].date).getUTCFullYear()
  const lastYear = new Date(byDate[byDate.length - 1].date).getUTCFullYear()
  const start = Date.UTC(firstYear, 0, 1)
  const end = Date.UTC(lastYear + 1, 0, 1)
  const xOf = (time: number) =>
    LEFT + ((time - start) / (end - start)) * (WIDTH - LEFT - RIGHT)

  const placed: Array<{ post: Post; x: number; level: number }> = []
  for (const post of byDate) {
    const x = xOf(Date.parse(post.date))
    const previous = placed.at(-1)
    const level = previous && x - previous.x < SIZE + 3 ? previous.level + 1 : 0
    placed.push({ post, x: level ? previous!.x : x, level })
  }
  const newest = placed[placed.length - 1]
  const years = Array.from(
    { length: lastYear - firstYear + 1 },
    (_, index) => firstYear + index,
  )

  return (
    <div className="post-timeline">
      <svg viewBox={`0 0 ${WIDTH} 132`} role="img" aria-label="Posts by date">
        <g filter="url(#pp-marker)">
          <path className="fig-axis" d={`M0 ${LINE_Y}H${WIDTH}`} />
          {years.map((year) => {
            const x = xOf(Date.UTC(year, 0, 1))
            return (
              <path
                key={year}
                className="fig-axis"
                d={`M${x} ${LINE_Y - 7}V${LINE_Y + 7}`}
              />
            )
          })}
        </g>
        {placed.map(({ post, x, level }) => (
          <a key={post.slug} href={`/blog/${post.slug}/`}>
            <title>{`${post.title} (${formatDate(post.date)})`}</title>
            <rect
              className="timeline-square"
              filter="url(#pp-marker)"
              x={x - SIZE / 2}
              y={LINE_Y - 9 - SIZE - level * (SIZE + 4)}
              width={SIZE}
              height={SIZE}
              style={{ fill: markColor(post) }}
            />
          </a>
        ))}
        {years.map((year) => (
          <text
            key={year}
            className="timeline-year"
            x={xOf(Date.UTC(year, 0, 1))}
            y={LINE_Y + 28}
          >
            {year}
          </text>
        ))}
        <text
          className="motif-hand timeline-note"
          x={newest.x - 14}
          y={22}
          textAnchor="end"
          transform={`rotate(-3 ${newest.x - 14} 22)`}
        >
          newest
        </text>
        <path
          className="ink-stroke"
          d={`M${newest.x - 10} 20C${newest.x - 2} 26 ${newest.x + 1} 40 ${newest.x} ${
            LINE_Y - 34 - newest.level * (SIZE + 4)
          }`}
        />
      </svg>
    </div>
  )
}

/** Titles only, in one column per year. */
export function PostsByYear({ posts }: { posts: Array<Post> }) {
  const years = new Map<number, Array<Post>>()
  for (const post of posts) {
    const year = new Date(post.date).getUTCFullYear()
    years.set(year, [...(years.get(year) ?? []), post])
  }
  return (
    <div className="posts-by-year">
      {[...years].map(([year, list]) => (
        <section key={year}>
          <h2>{year}</h2>
          <ul>
            {list.map((post) => (
              <li key={post.slug}>
                <Link
                  to="/blog/$slug/"
                  params={{ slug: post.slug }}
                  reloadDocument
                  style={{ '--mark': markColor(post) } as CSSProperties}
                >
                  <span className="mark-square" aria-hidden="true" />
                  <span className="post-list-title">{post.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
