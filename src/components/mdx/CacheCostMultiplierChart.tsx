import { createChartScene, defineChart, lineY } from '@tanstack/charts'
import { renderChartSvg } from '@tanstack/charts/svg'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'

type CacheCostPoint = {
  requests: number
  cached: number
  uncached: number
}

type Props = {
  title?: string
  caption?: string
}

// One cache write (1.25x) then (N - 1) reads at 0.1x each.
const POINTS: CacheCostPoint[] = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1
  return {
    requests: n,
    cached: Number((1.25 + 0.1 * (n - 1)).toFixed(2)),
    uncached: n,
  }
})

const definition = defineChart({
  marks: [
    lineY(POINTS, {
      id: 'cached',
      x: 'requests',
      y: 'cached',
      stroke: 'var(--green)',
      strokeWidth: 3,
    }),
    lineY(POINTS, {
      id: 'uncached',
      x: 'requests',
      y: 'uncached',
      stroke: 'var(--brick)',
      strokeWidth: 3,
      strokeDasharray: '6 4',
    }),
  ],
  scales: {
    x: {
      scale: () => scalePoint<number>().padding(0.4),
      axis: { label: 'Requests reusing the prefix (N)' },
    },
    y: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: { label: 'Relative input cost' },
    },
  },
})

const WIDTH = 720
const HEIGHT = 288

const svg = renderChartSvg(
  createChartScene(definition, { width: WIDTH, height: HEIGHT }),
  {
    ariaLabel:
      'Relative input cost as the number of requests reusing a prefix grows',
  },
)

export default function CacheCostMultiplierChart({ title, caption }: Props) {
  return (
    <figure className="my-8">
      {title && (
        <figcaption className="mb-4 text-[var(--foreground)]">
          <strong className="font-serif text-lg">{title}</strong>
        </figcaption>
      )}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
        <div
          className="w-full"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="mt-4 flex items-center gap-6 text-xs font-semibold">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--green)]" />
            Cached (1 write + re-reads at 0.1x)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--brick)]" />
            Uncached (full recompute each turn)
          </span>
        </div>
      </div>
      {caption && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{caption}</p>
      )}
    </figure>
  )
}
