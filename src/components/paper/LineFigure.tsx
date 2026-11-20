import { Figure, GraphPaper, HandNote, MARKS } from './Figure'
import type { MarkName } from './Figure'
import type { ReactNode } from 'react'

type Series = {
  name: string
  mark: MarkName
  dashed?: boolean
  points: Array<[number, number]>
  /** Text at the right end of the line. */
  endLabel?: string
}

type Props = {
  title: string
  series: Array<Series>
  xTicks: Array<number>
  yTicks: Array<number>
  xScale?: 'linear' | 'log'
  yScale?: 'linear' | 'log'
  xFormat?: (value: number) => string
  yFormat?: (value: number) => string
  xLabel?: string
  /** Dashed horizontal reference lines. */
  reference?: { y: number; label: string }
  references?: Array<{ y: number; label: string }>
  /** Handwritten notes at data coordinates. */
  notes?: Array<{
    x: number
    y: number
    text: string
    dx?: number
    dy?: number
  }>
  caption?: ReactNode
  description: string
}

const WIDTH = 640
const HEIGHT = 300
const LEFT = 52
const RIGHT = 528
const TOP = 26
const BOTTOM = 246

export function LineFigure({
  title,
  series,
  xTicks,
  yTicks,
  xScale = 'linear',
  yScale = 'linear',
  xFormat = String,
  yFormat = String,
  xLabel,
  reference,
  references = reference ? [reference] : [],
  notes = [],
  caption,
  description,
}: Props) {
  const xs = [...xTicks, ...series.flatMap((s) => s.points.map((p) => p[0]))]
  const ys = [...yTicks, ...series.flatMap((s) => s.points.map((p) => p[1]))]
  const transform = (value: number) =>
    xScale === 'log' ? Math.log10(value) : value
  const xMin = transform(Math.min(...xs))
  const xMax = transform(Math.max(...xs))
  const transformY = (value: number) =>
    yScale === 'log' ? Math.log10(value) : value
  const yMin = transformY(Math.min(...ys))
  const yMax = transformY(Math.max(...ys))
  const px = (value: number) =>
    LEFT + ((transform(value) - xMin) / (xMax - xMin)) * (RIGHT - LEFT)
  const py = (value: number) =>
    BOTTOM - ((transformY(value) - yMin) / (yMax - yMin)) * (BOTTOM - TOP)

  return (
    <Figure
      title={title}
      caption={caption}
      legend={series.map((item) => ({
        label: item.name,
        mark: item.mark,
        shape: item.dashed ? 'dashed' : 'line',
      }))}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={description}
      >
        <GraphPaper width={WIDTH} height={HEIGHT} />
        <g filter="url(#pp-rule)">
          {yTicks.map((tick) => (
            <path
              key={tick}
              className="fig-grid-major"
              d={`M${LEFT} ${py(tick)}H${RIGHT}`}
            />
          ))}
          <path className="fig-axis" d={`M${LEFT} ${BOTTOM}H${RIGHT}`} />
          {references.map((line) => (
            <path
              key={line.label}
              className="fig-axis"
              strokeDasharray="3 4"
              d={`M${LEFT} ${py(line.y)}H${RIGHT}`}
            />
          ))}
        </g>
        {yTicks.map((tick) => (
          <text key={tick} x={LEFT - 8} y={py(tick) + 4} textAnchor="end">
            {yFormat(tick)}
          </text>
        ))}
        {xTicks.map((tick) => (
          <text key={tick} x={px(tick)} y={BOTTOM + 18} textAnchor="middle">
            {xFormat(tick)}
          </text>
        ))}
        {xLabel ? (
          <text x={(LEFT + RIGHT) / 2} y={BOTTOM + 38} textAnchor="middle">
            {xLabel}
          </text>
        ) : null}
        {references.map((line) => (
          <text key={line.label} x={RIGHT + 8} y={py(line.y) + 4}>
            {line.label}
          </text>
        ))}
        {series.map((item) => {
          const last = item.points[item.points.length - 1]
          return (
            <g key={item.name}>
              <path
                d={item.points
                  .map(
                    ([x, y], index) => `${index ? 'L' : 'M'}${px(x)} ${py(y)}`,
                  )
                  .join('')}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={item.dashed ? '9 7' : undefined}
                filter="url(#pp-line)"
                style={{ stroke: MARKS[item.mark] }}
              />
              {item.endLabel ? (
                <text
                  className="fig-strong"
                  x={px(last[0]) + 8}
                  y={py(last[1]) + 4}
                >
                  {item.endLabel}
                </text>
              ) : null}
            </g>
          )
        })}
        {notes.map((note) => (
          <HandNote
            key={note.text}
            x={px(note.x) + (note.dx ?? 0)}
            y={py(note.y) + (note.dy ?? 0)}
            text={note.text}
            arrowTo={[px(note.x), py(note.y) - 6]}
          />
        ))}
      </svg>
    </Figure>
  )
}
