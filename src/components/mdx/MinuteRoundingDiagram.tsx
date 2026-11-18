import { useMemo } from 'react'
import { barX, defineChart, ruleX, text } from '@tanstack/charts'
import { Chart } from '@tanstack/charts/react'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { ChartBox, FigureFrame, useNarrowChart } from './FigureFrame'
import type { FigureText } from './FigureFrame'

type Job = {
  label: string
  /** Real duration in seconds. */
  seconds: number
}

type Props = FigureText & {
  jobs: Array<Job>
}

const SECONDS_PER_MINUTE = 60
/** Height of one row when the labels are at the side of the bars. */
const WIDE_ROW = 60
/** Height of one row when the label and the summary are above the bar. */
const NARROW_ROW = 76
/** Height of the duration axis with its title. */
const AXIS_SPACE = 60

export default function MinuteRoundingDiagram({ jobs, ...figure }: Props) {
  // The wide layout needs room for the summaries after the last boundary.
  const [boxRef, narrow] = useNarrowChart(660)

  const definition = useMemo(() => {
    const data = jobs.map((job) => {
      const minutes = Math.ceil(job.seconds / SECONDS_PER_MINUTE)

      return {
        ...job,
        minutes,
        billedSeconds: minutes * SECONDS_PER_MINUTE,
        summary: `${job.seconds} s real, ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} billed`,
      }
    })
    const maxBilled = Math.max(...data.map((job) => job.billedSeconds))
    const boundaries = Array.from(
      { length: maxBilled / SECONDS_PER_MINUTE },
      (_, index) => ({ second: (index + 1) * SECONDS_PER_MINUTE }),
    )
    const labels = data.map((job) => job.label)

    const base = defineChart({
      marks: [
        // In the phone layout, the boundary lines would cross the text. The
        // billed bars end on the minute ticks, which shows the same boundary.
        ruleX(narrow ? [] : boundaries, {
          id: 'minute-boundaries',
          x: 'second',
          stroke: 'var(--brick)',
          strokeOpacity: 0.5,
          strokeDasharray: '3 3',
        }),
        barX(data, {
          id: 'billed',
          x: 'billedSeconds',
          y: 'label',
          fill: 'var(--brick)',
          fillOpacity: 0.16,
          stroke: 'var(--brick)',
          strokeDasharray: '4 3',
          strokeWidth: 1,
          radius: 4,
          maxThickness: narrow ? 20 : 26,
        }),
        barX(data, {
          id: 'real',
          x: 'seconds',
          y: 'label',
          fill: 'var(--green)',
          radius: 3,
          maxThickness: narrow ? 8 : 10,
        }),
        text(data, {
          id: 'summaries',
          // The wide layout puts the summaries in one column, after the last
          // boundary line.
          x: () => (narrow ? 0 : maxBilled),
          y: 'label',
          text: 'summary',
          anchor: 'start',
          dx: narrow ? 0 : 10,
          dy: narrow ? -21 : 0,
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
                dy: -37,
                fill: 'var(--ink)',
                fontSize: 12,
              }),
            ]
          : []),
      ],
      scales: {
        x: {
          // The wide layout leaves room at the end for the summary labels.
          scale: scaleLinear().domain([0, maxBilled * (narrow ? 1.02 : 1.75)]),
          axis: {
            label: 'Job duration',
            line: false,
            tickLabels: { opacity: 0.7 },
            ticks: {
              size: 0,
              values: [0, ...boundaries.map((boundary) => boundary.second)],
              format: (value: number) =>
                value === 0 ? '0' : `${value / SECONDS_PER_MINUTE} min`,
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
        format: (point) => `${point.datum.label}: ${point.datum.summary}`,
      },
    })
  }, [jobs, narrow])

  return (
    <FigureFrame {...figure}>
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold">
        <span className="flex items-center gap-2">
          <span
            className="h-2 w-4 rounded-sm bg-[var(--green)]"
            aria-hidden="true"
          />
          Real duration
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-3 w-4 rounded-sm border border-dashed border-[var(--brick)]"
            aria-hidden="true"
          />
          Billed time
        </span>
      </div>
      <ChartBox ref={boxRef}>
        <Chart
          definition={definition}
          ariaLabel={figure.title}
          initialWidth={720}
          height={jobs.length * (narrow ? NARROW_ROW : WIDE_ROW) + AXIS_SPACE}
        />
      </ChartBox>
    </FigureFrame>
  )
}
