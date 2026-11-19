import { Figure, GraphPaper } from './Figure'
import type { ReactNode } from 'react'

type Row = { label: string; a?: number; b?: number }

type Props = {
  title: string
  unit?: string
  aLabel: string
  bLabel: string
  rows: Array<Row>
  caption?: ReactNode
}

const WIDTH = 640
const LABEL = 170
const AXIS_START = 184
const AXIS_END = 500
const ROW = 28
const TOP = 30

function format(value: number) {
  return value >= 1000
    ? Math.round(value).toLocaleString('en-US')
    : value.toFixed(1)
}

function niceStep(span: number) {
  const raw = span / 4
  const power = 10 ** Math.floor(Math.log10(raw))
  const unit = raw / power
  return (unit < 1.5 ? 1 : unit < 3.5 ? 2 : unit < 7.5 ? 5 : 10) * power
}

/**
 * Two measurements for each row on one shared axis, joined by a line. The
 * axis does not start at zero, so small differences stay visible.
 */
export function PairedDots({
  title,
  unit,
  aLabel,
  bLabel,
  rows,
  caption,
}: Props) {
  const values = rows.flatMap((row) =>
    [row.a, row.b].filter((value): value is number => value !== undefined),
  )
  const step = niceStep(Math.max(...values) - Math.min(...values))
  const min = Math.floor(Math.min(...values) / step) * step
  const max = Math.ceil(Math.max(...values) / step) * step
  const ticks = Array.from(
    { length: Math.round((max - min) / step) + 1 },
    (_, index) => min + index * step,
  )
  const x = (value: number) =>
    AXIS_START + ((value - min) / (max - min)) * (AXIS_END - AXIS_START)
  const sorted = [...rows].sort(
    (left, right) => (left.b ?? left.a ?? 0) - (right.b ?? right.a ?? 0),
  )
  const height = TOP + sorted.length * ROW + 12

  return (
    <Figure
      title={unit ? `${title} (${unit})` : title}
      caption={caption}
      legend={[
        { label: aLabel, mark: 'sand' },
        { label: bLabel, mark: 'lilac' },
      ]}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={`${title}${unit ? `, in ${unit}` : ''}. ${sorted
          .map(
            (row) =>
              `${row.label}: ${[
                row.a !== undefined ? `${aLabel} ${format(row.a)}` : '',
                row.b !== undefined ? `${bLabel} ${format(row.b)}` : '',
              ]
                .filter(Boolean)
                .join(', ')}`,
          )
          .join('. ')}.`}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        <g filter="url(#pp-rule)">
          {ticks.map((tick) => (
            <path
              key={tick}
              className="fig-grid-major"
              d={`M${x(tick)} ${TOP - 6}V${height - 8}`}
            />
          ))}
        </g>
        {ticks.map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={TOP - 12}
            textAnchor="middle"
            fontSize="10"
          >
            {format(tick).replace(/\.0$/, '')}
          </text>
        ))}
        {sorted.map((row, index) => {
          const y = TOP + index * ROW + ROW / 2
          const both = row.a !== undefined && row.b !== undefined
          return (
            <g key={row.label}>
              <text
                x={LABEL}
                y={y + 4}
                textAnchor="end"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
              >
                {row.label}
              </text>
              {both ? (
                <path
                  className="fig-axis"
                  d={`M${x(row.a as number)} ${y}H${x(row.b as number)}`}
                />
              ) : null}
              <g filter="url(#pp-marker)">
                {row.a !== undefined ? (
                  <rect
                    x={x(row.a) - 6}
                    y={y - 6}
                    width="12"
                    height="12"
                    style={{ fill: 'var(--m-sand)' }}
                  />
                ) : null}
                {row.b !== undefined ? (
                  <rect
                    x={x(row.b) - 6}
                    y={y - 6}
                    width="12"
                    height="12"
                    style={{ fill: 'var(--m-lilac)' }}
                  />
                ) : null}
              </g>
              <text
                className="fig-num"
                x={AXIS_END + 22}
                y={y + 5}
                fontSize="14"
              >
                {[row.a, row.b]
                  .filter((value): value is number => value !== undefined)
                  .map(format)
                  .join(' → ')}
              </text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}
