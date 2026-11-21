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
  repack: '630 10 600 260',
  folder: '650 30 590 232',
  route: '630 30 620 240',
  merge: '630 20 610 260',
  split: '630 30 610 240',
  quorum: '700 20 480 280',
  shrink: '640 20 480 260',
  stream: '640 20 600 260',
  orbit: '680 10 520 280',
  pulse: '630 30 610 240',
  sandbox: '620 10 620 280',
  window: '630 30 610 240',
  order: '630 30 600 240',
  ratchet: '640 20 590 270',
  tiers: '640 20 580 270',
  kept: '640 30 600 240',
  minutes: '640 20 590 270',
  store: '630 20 610 260',
  graph: '630 20 610 260',
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
const RIGHT = 110
const SIZE = 14
const STEP = SIZE + 4
const TOP = 26
const DAY = 86_400_000

/**
 * All posts on a drawn ruler, by date. One square per post, in the colour
 * of its subject. Posts in the same few weeks stack upward, and the drawing
 * grows to fit the tallest stack.
 */
export function PostTimeline({ posts }: { posts: Array<Post> }) {
  const byDate = [...posts].sort(
    (a, b) => Date.parse(a.date) - Date.parse(b.date),
  )
  const firstYear = new Date(byDate[0].date).getUTCFullYear()
  const start = Date.UTC(firstYear, 0, 1)
  const end = Date.parse(byDate[byDate.length - 1].date) + 40 * DAY
  const span = WIDTH - LEFT - RIGHT
  const xOf = (time: number) => LEFT + ((time - start) / (end - start)) * span

  const slots = Math.floor(span / (SIZE + 3))
  const slotWidth = span / slots
  const heights = new Map<number, number>()
  const placed = byDate.map((post) => {
    const slot = Math.min(
      slots - 1,
      Math.floor((xOf(Date.parse(post.date)) - LEFT) / slotWidth),
    )
    const level = heights.get(slot) ?? 0
    heights.set(slot, level + 1)
    return { post, x: LEFT + (slot + 0.5) * slotWidth, level }
  })
  const tallest = Math.max(...heights.values())
  const lineY = TOP + tallest * STEP + 9
  const topOf = (level: number) => lineY - 9 - SIZE - level * STEP

  const years: Array<{ year: number; x: number; count: number }> = []
  for (let year = firstYear; Date.UTC(year, 0, 1) < end; year++) {
    years.push({
      year,
      x: xOf(Date.UTC(year, 0, 1)),
      count: byDate.filter(
        (post) => new Date(post.date).getUTCFullYear() === year,
      ).length,
    })
  }
  const months: Array<number> = []
  for (let month = 1; Date.UTC(firstYear, month, 1) < end; month++) {
    if (month % 12) months.push(xOf(Date.UTC(firstYear, month, 1)))
  }
  const newest = placed[placed.length - 1]
  const newestTop = topOf(newest.level)

  return (
    <div className="post-timeline">
      <svg
        viewBox={`0 0 ${WIDTH} ${lineY + 52}`}
        role="img"
        aria-label="Posts by date"
      >
        <g filter="url(#pp-marker)">
          <path className="fig-axis" d={`M0 ${lineY}H${WIDTH}`} />
          {years.map(({ year, x }) => (
            <path
              key={year}
              className="fig-axis"
              d={`M${x} ${lineY - 7}V${lineY + 9}`}
            />
          ))}
        </g>
        {months.map((x) => (
          <path
            key={x}
            className="fig-axis timeline-month"
            d={`M${x} ${lineY}V${lineY + 4}`}
          />
        ))}
        {placed.map(({ post, x, level }) => (
          <a key={post.slug} href={`/blog/${post.slug}/`}>
            <title>{`${post.title} (${formatDate(post.date)})`}</title>
            <rect
              className="timeline-square"
              filter="url(#pp-marker)"
              x={x - SIZE / 2}
              y={topOf(level)}
              width={SIZE}
              height={SIZE}
              style={{ fill: markColor(post) }}
            />
          </a>
        ))}
        {years.map(({ year, x, count }) => (
          <text key={year} className="timeline-year" x={x + 6} y={lineY + 28}>
            {year}
            <tspan className="timeline-count" dx={7}>
              {count}
            </tspan>
          </text>
        ))}
        <text
          className="motif-hand timeline-note"
          x={newest.x + 26}
          y={newestTop - 8}
          transform={`rotate(-4 ${newest.x + 26} ${newestTop - 8})`}
        >
          newest
        </text>
        <path
          className="ink-stroke"
          d={`M${newest.x + 24} ${newestTop - 10}C${newest.x + 14} ${
            newestTop - 10
          } ${newest.x + 10} ${newestTop - 4} ${newest.x + 9} ${newestTop + 3}`}
        />
      </svg>
    </div>
  )
}
