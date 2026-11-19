import { useMemo } from 'react'
import { defineChart, waffleY } from '@tanstack/charts'
import { Chart } from '@tanstack/charts/react'
import { tooltip } from '@tanstack/charts/tooltip'

import { ChartBox, FigureFrame, toneColor } from './FigureFrame'
import type { FigureText, Tone } from './FigureFrame'

/** The muted tone is the rest of the total, so it is drawn lighter. */
function squareColor(tone: Tone) {
  return tone === 'muted'
    ? 'color-mix(in srgb, var(--muted) 34%, transparent)'
    : toneColor(tone)
}

type Segment = {
  label: string
  /** A whole number of units. Each unit is one square. */
  value: number
  tone: Tone
}

type Props = FigureText & {
  segments: Array<Segment>
  /** The unit of one square, for example "runs". */
  unit: string
  /** Squares in one row. The total must fill complete rows. */
  columns: number
  /** Limits the width, so that a small total does not give huge squares. */
  maxWidth?: number
}

export default function WaffleChart({
  segments,
  unit,
  columns,
  maxWidth,
  ...figure
}: Props) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const rows = Math.ceil(total / columns)

  const definition = useMemo(() => {
    const data = segments.map((segment) => ({
      ...segment,
      color: squareColor(segment.tone),
    }))
    const base = defineChart({
      marks: [
        waffleY(data, {
          id: 'units',
          y: 'value',
          key: 'label',
          fill: (segment) => segment.color,
          unit: 1,
          columns,
          gap: 3,
          radius: 3,
        }),
      ],
      // The squares fill the chart. There are no axes.
      guides: false,
      margin: 0,
      scales: { x: null, y: null },
    })

    return defineChart(base, {
      tooltip: {
        use: tooltip,
        format: (point) =>
          `${point.datum.value} of ${total} ${unit} ${point.datum.label}`,
      },
    })
  }, [segments, columns, total, unit])

  return (
    <FigureFrame {...figure}>
      <div style={maxWidth ? { maxWidth } : undefined}>
        <ChartBox>
          <Chart
            definition={definition}
            ariaLabel={figure.title}
            initialWidth={maxWidth ?? 720}
            aspectRatio={columns / rows}
          />
        </ChartBox>
      </div>
      <ul className="m-0 mt-4 grid list-none gap-2 p-0">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-baseline gap-2 text-sm">
            <span
              className="block h-3 w-3 flex-none translate-y-0.5 rounded-sm"
              style={{ background: squareColor(segment.tone) }}
              aria-hidden="true"
            />
            <span>
              <strong className="font-mono">
                {segment.value} of {total} {unit}
              </strong>
              <span className="text-[var(--muted-foreground)]">
                {' '}
                {segment.label}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </FigureFrame>
  )
}
