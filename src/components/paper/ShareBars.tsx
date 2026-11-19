import { Figure, GraphPaper } from './Figure'
import type { ReactNode } from 'react'

type Row = {
  label: string
  before: number
  after: number
  /** The unit after each number, such as "ns" or "B". */
  unit?: string
}

type Props = {
  title: string
  rows: Array<Row>
  beforeLabel?: string
  afterLabel?: string
  caption?: ReactNode
}

const WIDTH = 640
const LABEL = 118
const BAR_START = 130
const BAR_MAX = 290
const ROW = 46

function format(value: number) {
  return value >= 1000 ? value.toLocaleString('en-US') : String(value)
}

/**
 * Before and after for measures with different units. Each "before" bar has
 * the same length, so the "after" bars show what share is left.
 */
export function ShareBars({
  title,
  rows,
  beforeLabel = 'Before',
  afterLabel = 'After',
  caption,
}: Props) {
  const height = rows.length * ROW + 12
  return (
    <Figure
      title={title}
      caption={caption}
      legend={[
        { label: beforeLabel, mark: 'sand' },
        { label: afterLabel, mark: 'lilac' },
      ]}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={`${title}. ${rows
          .map(
            (row) =>
              `${row.label}: ${format(row.before)} to ${format(row.after)}${
                row.unit ? ` ${row.unit}` : ''
              }`,
          )
          .join('. ')}.`}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        {rows.map((row, index) => {
          const y = 8 + index * ROW
          const share = row.after / row.before
          const unit = row.unit ? ` ${row.unit}` : ''
          return (
            <g key={row.label}>
              <text x={LABEL} y={y + 20} textAnchor="end">
                {row.label}
              </text>
              <g filter="url(#pp-marker)">
                <rect
                  x={BAR_START}
                  y={y + 2}
                  width={BAR_MAX}
                  height="13"
                  style={{ fill: 'var(--m-sand)' }}
                />
                <rect
                  x={BAR_START}
                  y={y + 18}
                  width={Math.max(3, BAR_MAX * share)}
                  height="13"
                  style={{ fill: 'var(--m-lilac)' }}
                />
              </g>
              <text
                className="fig-num"
                x={BAR_START + BAR_MAX + 14}
                y={y + 15}
                fontSize="15"
              >
                {`${format(row.before)}${unit}`}
              </text>
              <text
                className="fig-num"
                x={BAR_START + BAR_MAX + 14}
                y={y + 32}
                fontSize="15"
              >
                {`${format(row.after)}${unit}`}
              </text>
              <text
                className="fig-strong"
                x={WIDTH - 8}
                y={y + 24}
                textAnchor="end"
              >
                {share < 1
                  ? `${Math.round((1 - share) * 100)}% less`
                  : `${Math.round((share - 1) * 100)}% more`}
              </text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}
