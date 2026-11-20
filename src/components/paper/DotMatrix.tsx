import { Figure, GraphPaper, HandNote, MARKS } from './Figure'
import type { MarkName } from './Figure'
import type { ReactNode } from 'react'

type Props = {
  title: string
  columns: Array<{ label: string; mark?: MarkName }>
  rows: Array<{ label: string; values: Array<boolean> }>
  /** A handwritten note under the grid. */
  note?: string
  caption?: ReactNode
}

const WIDTH = 640
const LABEL = 170
const TOP = 62
const ROW = 34

/** A yes/no grid: a filled marker square means yes. */
export function DotMatrix({ title, columns, rows, note, caption }: Props) {
  const step = (WIDTH - LABEL - 20) / columns.length
  const height = TOP + rows.length * ROW + (note ? 38 : 8)
  const x = (index: number) => LABEL + 10 + step * (index + 0.5)

  return (
    <Figure title={title} caption={caption}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={`${title}. ${rows
          .map(
            (row) =>
              `${row.label}: ${
                columns
                  .filter((_, index) => row.values[index])
                  .map((column) => column.label.replace('\n', ' '))
                  .join(', ') || 'none'
              }`,
          )
          .join('. ')}.`}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        {columns.map((column, index) =>
          column.label.split('\n').map((line, lineIndex, lines) => (
            <text
              key={`${column.label}-${line}`}
              className="fig-strong"
              x={x(index)}
              y={TOP - 20 - (lines.length - 1 - lineIndex) * 14}
              textAnchor="middle"
            >
              {line}
            </text>
          )),
        )}
        {rows.map((row, rowIndex) => {
          const y = TOP + rowIndex * ROW
          return (
            <g key={row.label}>
              <text x={LABEL} y={y + 17} textAnchor="end">
                {row.label}
              </text>
              <g filter="url(#pp-marker)">
                {row.values.map((value, index) => (
                  <rect
                    key={index}
                    x={x(index) - 11}
                    y={y + 2}
                    width="22"
                    height="22"
                    opacity={value ? 1 : 0.5}
                    style={{
                      fill: value
                        ? MARKS[columns[index].mark ?? 'lilac']
                        : 'var(--m-sand)',
                    }}
                  />
                ))}
              </g>
            </g>
          )
        })}
        {note ? (
          <HandNote
            x={LABEL + 30}
            y={TOP + rows.length * ROW + 22}
            text={note}
            rotate={-2}
          />
        ) : null}
      </svg>
    </Figure>
  )
}
