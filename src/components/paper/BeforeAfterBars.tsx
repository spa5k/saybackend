import { Figure, GraphPaper, HandNote, formatGain, formatValue } from './Figure'
import type { ReactNode } from 'react'

type Row = { label: string; before: number; after: number }

type Props = {
  title: string
  unit?: string
  data: Array<Row>
  beforeLabel?: string
  afterLabel?: string
  /** Handwritten notes, keyed by row label. Use "\n" for a line break. */
  notes?: Record<string, string>
  card?: { title?: string; body: ReactNode }
  caption?: ReactNode
}

const WIDTH = 640
const HEIGHT = 290
const BASE = 238
const MAX_BAR = 180

export function BeforeAfterBars({
  title,
  unit,
  data,
  beforeLabel = 'Before',
  afterLabel = 'After',
  notes = {},
  card,
  caption,
}: Props) {
  const left = card ? 214 : 70
  const right = card ? 616 : 570
  const slot = (right - left) / data.length
  const bar = Math.min(48, slot * 0.36)
  const max = Math.max(...data.flatMap((row) => [row.before, row.after]))
  const scale = (value: number) => Math.max(3, (value / max) * MAX_BAR)
  const summary = data
    .map((row) => `${row.label}: ${row.before} to ${row.after}`)
    .join('. ')

  return (
    <Figure
      title={unit ? `${title} (${unit})` : title}
      card={card}
      caption={caption}
      legend={[
        { label: beforeLabel, mark: 'sand' },
        { label: afterLabel, mark: 'lilac' },
      ]}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${title}${unit ? `, in ${unit}` : ''}. ${summary}.`}
      >
        <GraphPaper width={WIDTH} height={HEIGHT} />
        <path
          className="fig-axis"
          d={`M${left - 16} ${BASE}H${right + 4}`}
          filter="url(#pp-rule)"
        />
        {data.map((row, index) => {
          const center = left + slot * (index + 0.5)
          const beforeX = center - bar - 3
          const afterX = center + 3
          const beforeHeight = scale(row.before)
          const afterHeight = scale(row.after)
          const note = notes[row.label]
          const noteLines = note ? note.split('\n').length : 0
          return (
            <g key={row.label}>
              <g filter="url(#pp-marker)">
                <rect
                  x={beforeX}
                  y={BASE - beforeHeight}
                  width={bar}
                  height={beforeHeight}
                  style={{ fill: 'var(--m-sand)' }}
                />
                <rect
                  x={afterX}
                  y={BASE - afterHeight}
                  width={bar}
                  height={afterHeight}
                  style={{ fill: 'var(--m-lilac)' }}
                />
              </g>
              <text
                className="fig-num"
                x={beforeX + bar / 2}
                y={BASE - beforeHeight - 8}
                textAnchor="middle"
              >
                {formatValue(row.before)}
              </text>
              <text
                className="fig-num"
                x={afterX + bar / 2}
                y={BASE - afterHeight - 8}
                textAnchor="middle"
              >
                {formatValue(row.after)}
              </text>
              <text x={center} y={BASE + 20} textAnchor="middle">
                {row.label}
              </text>
              <text
                className="fig-strong"
                x={center}
                y={BASE + 36}
                textAnchor="middle"
              >
                {formatGain(row.before, row.after)}
              </text>
              {note ? (
                <HandNote
                  x={afterX + 2}
                  y={BASE - afterHeight - 62 - (noteLines - 1) * 17}
                  text={note}
                  rotate={index % 2 ? 3 : -4}
                  arrowTo={[afterX + bar / 2 + 4, BASE - afterHeight - 28]}
                />
              ) : null}
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}
