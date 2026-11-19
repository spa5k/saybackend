import { Figure } from './Figure'
import type { ReactNode } from 'react'

type Side = {
  /** How many of the squares are filled. */
  filled: number
  value: string
  label: string
}

type Props = {
  title: string
  total: number
  columns?: number
  before: Side
  after: Side
  /** A short handwritten note between the two values. */
  note?: string
  caption?: ReactNode
}

// A fixed sequence, so the server and the browser draw the same squares.
function shade(index: number) {
  return ((index * 37 + 11) % 17) / 17
}

function Squares({
  total,
  columns,
  filled,
  label,
}: {
  total: number
  columns: number
  filled: number
  label: string
}) {
  const rows = Math.ceil(total / columns)
  // One filled square reads better away from the corner.
  const single =
    filled === 1 ? Math.floor(rows / 2) * columns + Math.floor(columns / 3) : -1
  return (
    <svg
      viewBox={`0 0 ${columns * 16} ${rows * 16}`}
      role="img"
      aria-label={`${label}: ${filled} of ${total} squares are filled`}
    >
      <g filter="url(#pp-marker)">
        {Array.from({ length: total }, (_, index) => {
          const on = single >= 0 ? index === single : index < filled
          return (
            <rect
              key={index}
              x={(index % columns) * 16 + 1}
              y={Math.floor(index / columns) * 16 + 1}
              width="14"
              height="14"
              opacity={
                on ? 0.8 + shade(index) * 0.2 : 0.45 + shade(index) * 0.25
              }
              style={{ fill: on ? 'var(--m-lilac)' : 'var(--m-sand)' }}
            />
          )
        })}
      </g>
    </svg>
  )
}

/** Two unit grids side by side: how much work was done before and after. */
export function SquareCompare({
  title,
  total,
  columns = 16,
  before,
  after,
  note,
  caption,
}: Props) {
  return (
    <Figure title={title} caption={caption}>
      <div className="fig-pair-wrap">
        <div className="fig-pair">
          {[before, after].map((side) => (
            <div key={side.label}>
              <Squares
                total={total}
                columns={columns}
                filled={side.filled}
                label={side.label}
              />
              <span className="fig-pair-value">{side.value}</span>
              <span className="fig-pair-label">{side.label}</span>
            </div>
          ))}
        </div>
        {note ? (
          <span className="hand">
            {note}
            <svg viewBox="0 0 54 14" aria-hidden="true">
              <path
                className="ink-stroke"
                d="M2 9C16 3 34 3 50 8"
                markerEnd="url(#pp-ink-arrow)"
              />
            </svg>
          </span>
        ) : null}
      </div>
    </Figure>
  )
}
