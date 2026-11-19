import { Figure, GraphPaper, MARKS } from './Figure'
import type { MarkName } from './Figure'
import type { ReactNode } from 'react'

type Segment = { label: string; size: number; mark: MarkName }

type Props = {
  title: string
  segments: Array<Segment>
  unit?: string
  /** A line of fixed-width text below the bar, such as a format string. */
  pattern?: string
  caption?: ReactNode
  /** Run the figure across the full width of the page. */
  bleed?: boolean
}

const WIDTH = 640
const LEFT = 20
const RIGHT = 620
const TOP = 58
const BAR = 46

/** One bar cut into labelled parts: a bit layout, a byte layout, a budget. */
export function SegmentBar({
  title,
  segments,
  unit = 'bits',
  pattern,
  bleed,
  caption,
}: Props) {
  const total = segments.reduce((sum, segment) => sum + segment.size, 0)
  const scale = (RIGHT - LEFT) / total
  let offset = 0
  const placed = segments.map((segment) => {
    const start = offset
    offset += segment.size
    return {
      ...segment,
      start,
      x: LEFT + start * scale,
      width: segment.size * scale,
    }
  })
  let lastTickX = -100
  let lastTickLow = false
  const ticks = [...placed.map((segment) => segment.start), total].map(
    (value) => {
      const x = LEFT + value * scale
      const low = x - lastTickX < 16 && !lastTickLow
      lastTickX = x
      lastTickLow = low
      return { value, x, low }
    },
  )
  const height = pattern ? 170 : 132

  return (
    <Figure bleed={bleed} title={title} caption={caption}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={`${title}. ${placed
          .map((segment) => `${segment.label}: ${segment.size} ${unit}`)
          .join(', ')}.`}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        <g filter="url(#pp-marker)">
          {placed.map((segment) => (
            <rect
              key={segment.label}
              x={segment.x + 1}
              y={TOP}
              width={Math.max(2, segment.width - 2)}
              height={BAR}
              style={{ fill: MARKS[segment.mark] }}
            />
          ))}
        </g>
        {placed.map((segment, index) => {
          const narrow = segment.width < 70
          // Neighbouring narrow parts take turns on two label rows.
          const lift =
            narrow &&
            index > 0 &&
            placed[index - 1].width < 70 &&
            index % 2 === 0
              ? 15
              : 0
          const center = segment.x + segment.width / 2
          return (
            <g key={segment.label}>
              {narrow ? (
                <path
                  className="fig-axis"
                  d={`M${center} ${TOP - 4}V${TOP - 18 - lift}`}
                />
              ) : null}
              <text
                className="fig-strong"
                x={center}
                y={narrow ? TOP - 23 - lift : TOP - 9}
                textAnchor="middle"
              >
                {segment.label}
                <tspan fontWeight="400" style={{ fill: 'var(--muted)' }}>
                  {` ${segment.size}`}
                </tspan>
              </text>
            </g>
          )
        })}
        {ticks.map((tick) => (
          <text
            key={tick.value}
            x={tick.x}
            y={TOP + BAR + (tick.low ? 28 : 15)}
            textAnchor="middle"
            fontSize="10"
          >
            {tick.value}
          </text>
        ))}
        {pattern ? (
          <text
            className="fig-num"
            x={WIDTH / 2}
            y={TOP + BAR + 62}
            textAnchor="middle"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}
          >
            {pattern}
          </text>
        ) : null}
      </svg>
    </Figure>
  )
}
