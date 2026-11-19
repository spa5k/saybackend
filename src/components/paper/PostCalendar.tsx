import { GraphPaper, HandNote, MARKS } from './Figure'
import type { Post } from '@/lib/content'
import { markOf, otherMark, postMarks } from '@/lib/marks'

const COLUMN = 28
const ROW = 42
const LEFT = 56
const TOP = 30
const STACK = 3

/**
 * One marker square for each post, in a row for its year and a column for
 * its month. Each square links to its post.
 */
export function PostCalendar({ posts }: { posts: Array<Post> }) {
  const years = [...new Set(posts.map((post) => post.date.slice(0, 4)))]
    .sort()
    .slice(-4)
  const cells = new Map<string, number>()
  const squares = [...posts]
    .filter((post) => years.includes(post.date.slice(0, 4)))
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .map((post, index) => {
      const row = years.indexOf(post.date.slice(0, 4))
      const month = Number(post.date.slice(5, 7)) - 1
      const key = `${row}-${month}`
      const stacked = cells.get(key) ?? 0
      cells.set(key, stacked + 1)
      return { post, row, month, stacked, index }
    })
    .filter((square) => square.stacked < STACK)

  const width = 420
  const height = TOP + years.length * ROW + 44
  const lastYear = years.at(-1)
  const lastRow = years.length - 1
  const inLastYear = posts.filter((post) =>
    post.date.startsWith(lastYear ?? ''),
  )
  const lastMonth = Math.max(
    ...inLastYear.map((post) => Number(post.date.slice(5, 7)) - 1),
  )
  const first = squares[0]
  const used = new Set(posts.map((post) => markOf(post).name))

  return (
    <figure className="post-calendar fig not-typography">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${posts.length} posts, one square for each, by year and month`}
      >
        <GraphPaper width={width} height={height} bleed={40} />
        <g filter="url(#pp-marker)">
          {squares.map(({ post, row, month, stacked, index }) => (
            <a key={post.slug} href={`/blog/${post.slug}/`}>
              <title>{post.title}</title>
              <rect
                x={LEFT + month * COLUMN + 1}
                y={TOP + row * ROW + (STACK - 1 - stacked) * 14 + 1}
                width={COLUMN - 2}
                height="12"
                opacity={0.82 + ((index * 7) % 5) * 0.04}
                style={{ fill: MARKS[markOf(post).mark] }}
              />
            </a>
          ))}
        </g>
        {years.map((year, row) => (
          <text key={year} x="20" y={TOP + row * ROW + 32} fontSize="10">
            {year}
          </text>
        ))}
        {['Jan', 'Jun', 'Dec'].map((name, index) => (
          <text
            key={name}
            x={LEFT + [0, 5, 11][index] * COLUMN + 2}
            y={TOP + years.length * ROW + 18}
            fontSize="10"
          >
            {name}
          </text>
        ))}
        {squares.length ? (
          <HandNote
            x={LEFT + first.month * COLUMN + 62}
            y={18}
            text="one square = one post"
            arrowTo={[
              LEFT + first.month * COLUMN + COLUMN + 2,
              TOP + first.row * ROW + (STACK - 1 - first.stacked) * 14 + 4,
            ]}
            anchor="start"
          />
        ) : null}
        {inLastYear.length > 1 && lastMonth < 10 ? (
          <HandNote
            x={LEFT + (lastMonth + 1) * COLUMN + 16}
            y={TOP + lastRow * ROW + 14}
            text={`${inLastYear.length} this\nyear`}
            rotate={-4}
          />
        ) : null}
      </svg>
      <ul className="fig-legend" data-pagefind-ignore="">
        {[...postMarks, otherMark]
          .filter((entry) => used.has(entry.name))
          .map((entry) => (
            <li key={entry.name}>
              <span
                className="mark-square"
                style={{ background: MARKS[entry.mark] }}
              />
              {entry.name}
            </li>
          ))}
      </ul>
    </figure>
  )
}
