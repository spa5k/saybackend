import { useMemo } from 'react'
import { barX, defineChart, text } from '@tanstack/charts'
import { Chart } from '@tanstack/charts/react'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { ChartBox, FigureFrame, toneColor, useNarrowChart } from './FigureFrame'
import type { FigureText, Tone } from './FigureFrame'

type Row = {
  label: string
  value: number
  /** Exact value as printed in the source, with its unit. */
  display: string
  tone?: Tone
  /** Upper end of a range. The part above `value` is drawn as an estimate. */
  rangeTo?: number
}

type Props = FigureText & {
  rows: Array<Row>
  /** Title of the value axis, with the unit. */
  axisLabel: string
}

/** Height of one row when the labels are at the side of the bars. */
const WIDE_ROW = 46
/** Height of one row when the label and the value are above the bar. */
const NARROW_ROW = 64
/** Height of the value axis with its title. */
const AXIS_SPACE = 60
const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export default function ValueBarChart({ rows, axisLabel, ...figure }: Props) {
  const [boxRef, narrow] = useNarrowChart()

  const definition = useMemo(() => {
    const data = rows.map((row) => ({
      ...row,
      end: row.rangeTo ?? row.value,
      color: toneColor(row.tone ?? 'brick'),
    }))
    const ranges = data.filter((row) => row.rangeTo !== undefined)
    const largest = Math.max(...data.map((row) => row.end), 0)
    const labels = data.map((row) => row.label)
    const thickness = narrow ? 10 : 20

    const base = defineChart({
      marks: [
        barX(ranges, {
          id: 'ranges',
          x1: 'value',
          x2: 'end',
          y: 'label',
          fill: (row) => row.color,
          fillOpacity: 0.28,
          stroke: (row) => row.color,
          strokeDasharray: '4 3',
          strokeWidth: 1,
          radius: 4,
          maxThickness: thickness,
        }),
        barX(data, {
          id: 'bars',
          x: 'value',
          y: 'label',
          fill: (row) => row.color,
          radius: 4,
          maxThickness: thickness,
        }),
        text(data, {
          id: 'values',
          x: narrow ? () => 0 : 'end',
          y: 'label',
          text: 'display',
          anchor: 'start',
          dx: narrow ? 0 : 8,
          dy: narrow ? -15 : 0,
          fill: 'var(--ink)',
          fontSize: 12,
          fontWeight: 600,
        }),
        ...(narrow
          ? [
              text(data, {
                id: 'labels',
                x: () => 0,
                y: 'label',
                text: 'label',
                anchor: 'start',
                dy: -31,
                fill: 'var(--ink)',
                fontSize: 12,
              }),
            ]
          : []),
      ],
      scales: {
        x: {
          // The wide layout leaves room at the end for the value labels.
          scale: scaleLinear().domain([0, largest * (narrow ? 1.02 : 1.45)]),
          // In the phone layout, grid lines would cross the text.
          grid: !narrow,
          axis: {
            label: axisLabel,
            line: false,
            tickLabels: { opacity: 0.7 },
            ticks: {
              count: narrow ? 3 : 5,
              size: 0,
              format: (value: number) =>
                value >= 1000 ? compact.format(value) : String(value),
            },
          },
        },
        y: {
          // The phone layout has text above each bar, so the spare room goes
          // to the top of the chart.
          scale: scaleBand<string>()
            .domain(labels)
            .padding(0.3)
            .align(narrow ? 1 : 0.5),
          axis: narrow
            ? false
            : {
                line: false,
                ticks: { size: 0 },
                tickLabels: { opacity: 1 },
              },
        },
      },
    })

    return defineChart(base, {
      tooltip: {
        use: tooltip,
        format: (point) => `${point.datum.label}: ${point.datum.display}`,
      },
    })
  }, [rows, axisLabel, narrow])

  return (
    <FigureFrame {...figure}>
      <ChartBox ref={boxRef}>
        <Chart
          definition={definition}
          ariaLabel={figure.title}
          initialWidth={720}
          height={rows.length * (narrow ? NARROW_ROW : WIDE_ROW) + AXIS_SPACE}
        />
      </ChartBox>
    </FigureFrame>
  )
}
