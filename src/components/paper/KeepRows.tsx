import { Figure, GraphPaper, MARKS } from './Figure'
import type { MarkName } from './Figure'
import type { ReactNode } from 'react'

type Row = {
  label: string
  /** The share that is kept, from 0 to 1. */
  kept: number
  mark: MarkName
}

type Props = {
  title: string
  rows: Array<Row>
  /** Squares in each row. */
  squares?: number
  caption?: ReactNode
}

const WIDTH = 640
const LABEL = 180
const ROW = 34
const CELL = 17

/** Rows of unit squares: the filled ones are kept, the faint ones dropped. */
export function KeepRows({ title, rows, squares = 20, caption }: Props) {
  const height = rows.length * ROW + 10
  return (
    <Figure title={title} caption={caption}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={`${title}. ${rows
          .map((row) => `${row.label}: ${Math.round(row.kept * 100)}% kept`)
          .join('. ')}.`}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        {rows.map((row, rowIndex) => {
          const y = 8 + rowIndex * ROW
          const filled = Math.max(1, Math.round(row.kept * squares))
          return (
            <g key={row.label}>
              <text x={LABEL} y={y + 14} textAnchor="end">
                {row.label}
              </text>
              <g filter="url(#pp-marker)">
                {Array.from({ length: squares }, (_, index) => {
                  // Spread the kept squares along the row.
                  const on =
                    filled >= squares ||
                    Math.floor(((index + 1) * filled) / squares) >
                      Math.floor((index * filled) / squares)
                  return (
                    <rect
                      key={index}
                      x={LABEL + 12 + index * CELL}
                      y={y}
                      width={CELL - 3}
                      height={CELL - 3}
                      opacity={on ? 1 : 0.7}
                      style={{ fill: on ? MARKS[row.mark] : 'var(--m-sand)' }}
                    />
                  )
                })}
              </g>
              <text
                className="fig-num"
                x={LABEL + 22 + squares * CELL}
                y={y + 14}
                style={{ fontSize: 15 }}
              >
                {`${Math.round(row.kept * 100)}%`}
              </text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}
