import { useMemo } from 'react'
import { barY, defineChart, text } from '@tanstack/charts'
import { Chart } from '@tanstack/charts/react'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import {
  ChartBox,
  FigureFrame,
  figurePanel,
  figurePanelTitle,
} from './FigureFrame'
import type { FigureText } from './FigureFrame'

type Sample = {
  title: string
  before: number
  after: number
  /** Exact values as printed in the source, with the unit. */
  beforeDisplay: string
  afterDisplay: string
  reduction: string
}

type Props = FigureText & {
  /** Each sample has its own scale. The samples must not be compared. */
  samples: Array<Sample>
}

const PHASES = ['Before', 'After']

function SampleChart({ sample }: { sample: Sample }) {
  const definition = useMemo(() => {
    const data = [
      {
        phase: PHASES[0],
        value: sample.before,
        display: sample.beforeDisplay,
        color: 'var(--brick)',
      },
      {
        phase: PHASES[1],
        value: sample.after,
        display: sample.afterDisplay,
        color: 'var(--green)',
      },
    ]
    const top = Math.max(sample.before, sample.after)

    const base = defineChart({
      marks: [
        barY(data, {
          id: 'bars',
          x: 'phase',
          y: 'value',
          fill: (row) => row.color,
          radius: 4,
          maxThickness: 56,
        }),
        text(data, {
          id: 'values',
          x: 'phase',
          y: 'value',
          text: 'display',
          dy: -10,
          fill: 'var(--ink)',
          fontSize: 12,
          fontWeight: 600,
        }),
      ],
      scales: {
        x: {
          scale: scaleBand<string>().domain(PHASES).padding(0.35),
          axis: {
            line: false,
            ticks: { size: 0 },
            tickLabels: { opacity: 1 },
          },
        },
        y: {
          // Starts at zero, with room above the taller bar for its label.
          scale: scaleLinear().domain([0, top * 1.18]),
          grid: true,
          axis: {
            line: false,
            tickLabels: { opacity: 0.7 },
            ticks: {
              count: 3,
              size: 0,
              format: (value: number) => value.toLocaleString('en-US'),
            },
          },
        },
      },
    })

    return defineChart(base, {
      tooltip: {
        use: tooltip,
        format: (point) => `${point.datum.phase}: ${point.datum.display}`,
      },
    })
  }, [sample])

  return (
    <ChartBox>
      <Chart
        definition={definition}
        ariaLabel={`${sample.title}: ${sample.beforeDisplay} before, ${sample.afterDisplay} after`}
        initialWidth={240}
        height={190}
      />
    </ChartBox>
  )
}

export default function PairedSamples({ samples, ...figure }: Props) {
  return (
    <FigureFrame {...figure}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {samples.map((sample) => (
          <div
            key={sample.title}
            className={`${figurePanel} min-w-0 [--chart-halo:var(--card)]`}
          >
            <div className={`${figurePanelTitle} sm:min-h-[2lh]`}>
              {sample.title}
            </div>
            <SampleChart sample={sample} />
            <p className="mt-2 mb-0 text-center font-mono text-xs font-semibold text-[var(--green)]">
              {sample.reduction}
            </p>
          </div>
        ))}
      </div>
    </FigureFrame>
  )
}
