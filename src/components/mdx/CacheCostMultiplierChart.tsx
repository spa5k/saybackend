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
import {
  EditorialFigure,
  LegendSwatch,
  fig,
  accentTint,
} from './editorialFigure'

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
      fill: accentTint(0.05),
      fillOpacity: 1,
    }),
    lineY(POINTS, {
      id: 'cached',
      x: 'requests',
      y: 'cached',
      stroke: fig.accent,
      strokeWidth: 1.5,
    }),
    lineY(POINTS, {
      id: 'uncached',
      x: 'requests',
      y: 'uncached',
      stroke: fig.muted,
      strokeWidth: 1.25,
      strokeDasharray: '5 4',
    }),
    ruleY([{ y: 1.25 }], {
      id: 'write-cost',
      y: 'y',
      stroke: fig.lineStrong,
      strokeOpacity: 0.7,
      strokeWidth: 1,
      strokeDasharray: '3 3',
    }),
    dot(POINTS, {
      id: 'cached-dots',
      x: 'requests',
      y: 'cached',
      r: 3,
      fill: fig.paper,
      stroke: fig.accent,
      strokeWidth: 1.25,
    }),
    dot(POINTS, {
      id: 'uncached-dots',
      x: 'requests',
      y: 'uncached',
      r: 3,
      fill: fig.paper,
      stroke: fig.muted,
      strokeWidth: 1.25,
    }),
    text([{ x: 1, y: 1.25, label: '1.25×' }], {
      x: 'x',
      y: 'y',
      text: 'label',
      fill: fig.accent,
      fontSize: 10.5,
      anchor: 'start',
      dx: 6,
      dy: -14,
    }),
    text([{ x: LAST.requests, y: LAST.cached, label: '2.15×' }], {
      x: 'x',
      y: 'y',
      text: 'label',
      fill: fig.accent,
      fontSize: 10.5,
      anchor: 'end',
      dx: -8,
      dy: -12,
    }),
    text([{ x: LAST.requests, y: LAST.uncached, label: '10×' }], {
      x: 'x',
      y: 'y',
      text: 'label',
      fill: fig.muted,
      fontSize: 10.5,
      anchor: 'start',
      dx: 8,
      dy: 14,
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
const HEIGHT = 340

const svg = renderChartSvg(
  createChartScene(definition, { width: WIDTH, height: HEIGHT }),
  {
    ariaLabel:
      'Relative input cost as the number of requests reusing a prefix grows',
  },
)

export default function CacheCostMultiplierChart({ title, caption }: Props) {
  return (
    <EditorialFigure title={title} caption={caption}>
      <div
        style={{
          color: '#8f8877',
          fontFamily: 'inherit',
        }}
      >
        <div
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <div
        style={{
          marginTop: 14,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px 26px',
        }}
      >
        <LegendSwatch
          color={fig.accent}
          label="Cached — one write, re-reads at 0.1×"
        />
        <LegendSwatch
          color={fig.muted}
          dash
          label="Uncached — full recompute each turn"
        />
        <LegendSwatch
          color={fig.lineStrong}
          dash
          label="First write at 1.25×"
        />
      </div>
    </EditorialFigure>
  )
}
