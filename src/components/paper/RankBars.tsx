import { Figure, GraphPaper, HandNote, MARKS, formatValue } from './Figure'
import type { MarkName } from './Figure'
import type { ReactNode } from 'react'

type Row = {
  label: string
  value: number
  mark?: MarkName
  /** A handwritten note at the end of this bar. */
  note?: string
  /** A line of small text under the bar. */
  sub?: string
}

type Props = {
  title: string
  unit?: string
  rows: Array<Row>
  legend?: Array<{ label: string; mark: MarkName }>
  /** Show the row labels in the fixed-width font, for code names. */
  mono?: boolean
  /** Start the bars at this value, to show small differences. */
  from?: number
  caption?: ReactNode
}

const WIDTH = 640
const LABEL = 196
const BAR_MAX = 300
const ROW = 28

/** Horizontal marker bars for a ranked list of values. */
export function RankBars({
  title,
  unit,
  rows,
  legend,
  from = 0,
  mono = false,
  caption,
}: Props) {
  const rowHeight = rows.some((row) => row.sub) ? ROW + 14 : ROW
  const height = rows.length * rowHeight + 24
  const max = Math.max(...rows.map((row) => row.value))
  const length = (value: number) =>
    Math.max(3, ((value - from) / (max - from)) * BAR_MAX)
  return (
    <Figure
      title={unit ? `${title} (${unit})` : title}
      legend={legend}
      caption={caption}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={`${title}${unit ? `, in ${unit}` : ''}. ${rows
          .map((row) => `${row.label}: ${formatValue(row.value)}`)
          .join('. ')}.`}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        <path
          className="fig-axis"
          d={`M${LABEL} 6V${height - 14}`}
          filter="url(#pp-rule)"
        />
        {rows.map((row, index) => {
          const y = 12 + index * rowHeight
          const end = LABEL + length(row.value)
          return (
            <g key={row.label}>
              <text
                x={LABEL - 10}
                y={y + 14}
                textAnchor="end"
                style={
                  mono
                    ? { fontFamily: 'var(--font-mono)', fontSize: 10.5 }
                    : undefined
                }
              >
                {row.label}
              </text>
              {row.sub ? (
                <text x={LABEL} y={y + 31} fontSize="10.5">
                  {row.sub}
                </text>
              ) : null}
              <rect
                x={LABEL}
                y={y + 3}
                width={length(row.value)}
                height={ROW - 12}
                filter="url(#pp-marker)"
                style={{ fill: MARKS[row.mark ?? 'sand'] }}
              />
              <text className="fig-num" x={end + 8} y={y + 16} fontSize="15">
                {formatValue(row.value)}
              </text>
              {row.note ? (
                <HandNote x={end + 62} y={y + 16} text={row.note} rotate={-2} />
              ) : null}
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}
