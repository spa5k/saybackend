import {
  areaY,
  createChartScene,
  defineChart,
  dot,
  lineY,
  ruleY,
  text,
} from '@tanstack/charts'
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

// The gap between the two lines: what caching saves per request.
const SAVINGS = POINTS.map((p) => ({
  requests: p.requests,
  low: Math.min(p.cached, p.uncached),
  high: Math.max(p.cached, p.uncached),
}))

const LAST = POINTS[POINTS.length - 1]

const definition = defineChart({
  marks: [
    areaY(SAVINGS, {
      id: 'savings',
      x: 'requests',
      y1: 'low',
      y2: 'high',
      fill: 'var(--green)',
      fillOpacity: 0.08,
    }),
    lineY(POINTS, {
      id: 'cached',
      x: 'requests',
      y: 'cached',
      stroke: 'var(--green)',
      strokeWidth: 2.5,
    }),
    lineY(POINTS, {
      id: 'uncached',
      x: 'requests',
      y: 'uncached',
      stroke: 'var(--brick)',
      strokeWidth: 2.5,
      strokeDasharray: '6 4',
    }),
    ruleY([{ y: 1.25 }], {
      id: 'write-cost',
      y: 'y',
      stroke: 'var(--muted)',
      strokeOpacity: 0.6,
      strokeWidth: 1,
      strokeDasharray: '3 3',
    }),
    dot(POINTS, {
      id: 'cached-dots',
      x: 'requests',
      y: 'cached',
      r: 4,
      fill: 'var(--card)',
      stroke: 'var(--green)',
      strokeWidth: 2,
    }),
    dot(POINTS, {
      id: 'uncached-dots',
      x: 'requests',
      y: 'uncached',
      r: 4,
      fill: 'var(--card)',
      stroke: 'var(--brick)',
      strokeWidth: 2,
    }),
    text([{ x: 1, y: 1.25, label: '1.25×' }], {
      x: 'x',
      y: 'y',
      text: 'label',
      fill: 'var(--green)',
      fontSize: 11,
      fontWeight: 600,
      anchor: 'start',
      dx: 6,
      dy: -14,
    }),
    text([{ x: LAST.requests, y: LAST.uncached, label: `${LAST.uncached}×` }], {
      x: 'x',
      y: 'y',
      text: 'label',
      fill: 'var(--brick)',
      fontSize: 12,
      fontWeight: 600,
      anchor: 'start',
      dx: 8,
      dy: 16,
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
      axis: {
        label: 'Relative input cost',
        tickLabels: { opacity: 0.9 },
      },
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
      <div className="rounded-xl bg-[var(--card)] p-4 shadow-sm sm:p-6">
        <div
          className="w-full"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--green)]" />
            Cached (1 write + re-reads at 0.1×)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--brick)]" />
            Uncached (full recompute each turn)
          </span>
          <span className="flex items-center gap-2 text-[var(--muted)]">
            <span className="inline-block h-0 w-4 border-t border-dashed border-[var(--muted)]" />
            First write at 1.25×
          </span>
        </div>
      </div>
      {caption && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{caption}</p>
      )}
    </figure>
  )
}
