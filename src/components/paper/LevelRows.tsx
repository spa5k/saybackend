import { Figure, GraphPaper, MARKS } from './Figure'
import type { MarkName } from './Figure'
import type { ReactNode } from 'react'

type Props = {
  title: string
  columns: Array<{ label: string; max: number; mark: MarkName }>
  rows: Array<{ label: string; sub?: string; values: Array<number> }>
  caption?: ReactNode
}

const WIDTH = 640
const LABEL = 196
const TOP = 34
const ROW = 40
const CELL = 15

/** A rating for each row on a few scales, as counts of marker squares. */
export function LevelRows({ title, columns, rows, caption }: Props) {
  const step = (WIDTH - LABEL - 10) / columns.length
  const height = TOP + rows.length * ROW + 4
  return (
    <Figure title={title} caption={caption}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={`${title}. ${rows
          .map(
            (row) =>
              `${row.label}: ${columns
                .map(
                  (column, index) =>
                    `${column.label} ${row.values[index]} of ${column.max}`,
                )
                .join(', ')}`,
          )
          .join('. ')}.`}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        {columns.map((column, index) => (
          <text
            key={column.label}
            className="fig-strong"
            x={LABEL + 14 + index * step}
            y={TOP - 14}
          >
            {column.label}
          </text>
        ))}
        {rows.map((row, rowIndex) => {
          const y = TOP + rowIndex * ROW
          return (
            <g key={row.label}>
              <text
                className="fig-strong"
                x={LABEL}
                y={y + 12}
                textAnchor="end"
              >
                {row.label}
              </text>
              {row.sub ? (
                <text
                  x={LABEL}
                  y={y + 26}
                  textAnchor="end"
                  style={{ fontSize: 11 }}
                >
                  {row.sub}
                </text>
              ) : null}
              <g filter="url(#pp-marker)">
                {columns.map((column, columnIndex) =>
                  Array.from({ length: column.max }, (_, index) => (
                    <rect
                      key={`${column.label}-${index}`}
                      x={LABEL + 14 + columnIndex * step + index * CELL}
                      y={y + 3}
                      width={CELL - 3}
                      height={CELL - 3}
                      opacity={index < row.values[columnIndex] ? 1 : 0.6}
                      style={{
                        fill:
                          index < row.values[columnIndex]
                            ? MARKS[column.mark]
                            : 'var(--m-sand)',
                      }}
                    />
                  )),
                )}
              </g>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}
