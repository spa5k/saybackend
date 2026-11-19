import { Figure } from './Figure'
import type { ReactNode } from 'react'

type Props = {
  title: string
  /** The part and the whole, as counts. */
  part: number
  total: number
  label: string
  /** More numbers, shown next to the grid. */
  stats?: Array<{ value: string; label: string }>
  caption?: ReactNode
}

/** A 10 × 10 grid of squares that shows one share, with a few key numbers. */
export function ShareGrid({
  title,
  part,
  total,
  label,
  stats = [],
  caption,
}: Props) {
  const filled = Math.round((part / total) * 100)
  return (
    <Figure title={title} caption={caption}>
      <div className="share-grid">
        <svg
          viewBox="0 0 160 160"
          role="img"
          aria-label={`${part.toLocaleString('en-US')} of ${total.toLocaleString('en-US')}: ${filled} of 100 squares are filled`}
        >
          <g filter="url(#pp-marker)">
            {Array.from({ length: 100 }, (_, index) => (
              <rect
                key={index}
                x={(index % 10) * 16 + 1}
                y={Math.floor(index / 10) * 16 + 1}
                width="13"
                height="13"
                opacity={index < filled ? 1 : 0.6}
                style={{
                  fill: index < filled ? 'var(--m-lilac)' : 'var(--m-sand)',
                }}
              />
            ))}
          </g>
        </svg>
        <dl>
          <div>
            <dt>
              {part.toLocaleString('en-US')}{' '}
              <small>of {total.toLocaleString('en-US')}</small>
            </dt>
            <dd>{label}</dd>
          </div>
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.value}</dt>
              <dd>{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Figure>
  )
}
