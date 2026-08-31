import {
  createChartScene,
  defineChart,
  dot,
  d3Curve,
  lineY,
  ruleX,
  ruleY,
  text,
} from '@tanstack/charts'
import { renderChartSvg } from '@tanstack/charts/svg'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { curveMonotoneX } from 'd3-shape'
import { scaleLog } from 'd3-scale'

type BreakevenPoint = {
  requests: number
  tokens: number
}

type Props = {
  title?: string
  caption?: string
}

// OpenAI prompt-caching break-even: L = 102.4 + 1177.6 / N
// Longest prefix length that is NOT worth expanding to a 1024-token cache.
const POINTS: BreakevenPoint[] = [
  { requests: 2, tokens: 691.2 },
  { requests: 3, tokens: 494.9 },
  { requests: 4, tokens: 396.8 },
  { requests: 5, tokens: 337.9 },
  { requests: 6, tokens: 298.7 },
  { requests: 8, tokens: 249.6 },
  { requests: 10, tokens: 220.2 },
  { requests: 20, tokens: 161.3 },
  { requests: 50, tokens: 125.9 },
  { requests: 100, tokens: 114.2 },
  { requests: 500, tokens: 104.8 },
  { requests: 1963, tokens: 103.0 },
].map((p) => ({ ...p, tokens: Number(p.tokens.toFixed(1)) }))

const TEN_REQUESTS = POINTS.find((p) => p.requests === 10)!
const ASYMPTOTE = POINTS[POINTS.length - 1]

const X_TICKS = [2, 10, 50, 100, 500, 1000, 2000]
const formatTick = (value: number) =>
  value >= 1000 ? `${value / 1000}k` : String(value)

const WIDTH = 720
const HEIGHT = 288

const definition = defineChart({
  marks: [
    lineY(POINTS, {
      id: 'breakeven',
      x: 'requests',
      y: 'tokens',
      stroke: 'var(--green)',
      strokeWidth: 2.5,
      curve: d3Curve(curveMonotoneX),
    }),
    ruleX([{ requests: TEN_REQUESTS.requests }], {
      x: 'requests',
      stroke: 'var(--green)',
      strokeOpacity: 0.45,
      strokeWidth: 1.5,
      strokeDasharray: '4 4',
    }),
    ruleX([{ requests: ASYMPTOTE.requests }], {
      x: 'requests',
      stroke: 'var(--brick)',
      strokeOpacity: 0.45,
      strokeWidth: 1.5,
      strokeDasharray: '4 4',
    }),
    ruleY([{ y: 102.4 }], {
      y: 'y',
      stroke: 'var(--muted)',
      strokeOpacity: 0.55,
      strokeWidth: 1,
      strokeDasharray: '3 3',
    }),
    dot([TEN_REQUESTS], {
      id: 'ten-dot',
      x: 'requests',
      y: 'tokens',
      r: 4.5,
      fill: 'var(--card)',
      stroke: 'var(--green)',
      strokeWidth: 2,
    }),
    dot([ASYMPTOTE], {
      id: 'asymptote-dot',
      x: 'requests',
      y: 'tokens',
      r: 4.5,
      fill: 'var(--card)',
      stroke: 'var(--brick)',
      strokeWidth: 2,
    }),
    text([{ x: TEN_REQUESTS.requests, y: TEN_REQUESTS.tokens, label: '221' }], {
      x: 'x',
      y: 'y',
      text: 'label',
      fill: 'var(--green)',
      fontSize: 11,
      fontWeight: 600,
      anchor: 'start',
      dx: 8,
      dy: -10,
    }),
    text([{ x: ASYMPTOTE.requests, y: ASYMPTOTE.tokens, label: '103' }], {
      x: 'x',
      y: 'y',
      text: 'label',
      fill: 'var(--brick)',
      fontSize: 11,
      fontWeight: 600,
      anchor: 'end',
      dx: -8,
      dy: -12,
    }),
    text([{ x: 2, y: 102.4, label: 'asymptote 102.4' }], {
      x: 'x',
      y: 'y',
      text: 'label',
      fill: 'var(--muted)',
      fontSize: 10,
      anchor: 'start',
      dx: 4,
      dy: -6,
    }),
  ],
  scales: {
    x: {
      scale: () => scaleLog().domain([2, 2200]),
      axis: {
        label: 'Requests reusing the prefix (N)',
        ticks: { values: X_TICKS, format: formatTick },
        tickLabels: { opacity: 0.9 },
      },
    },
    y: {
      scale: scaleLinear,
      domain: [100, 720],
      grid: true,
      axis: {
        label: 'Longest prefix not worth caching (tokens)',
        ticks: { values: [200, 300, 400, 500, 600, 700] },
        tickLabels: { opacity: 0.9 },
      },
    },
  },
})

const svg = renderChartSvg(
  createChartScene(definition, { width: WIDTH, height: HEIGHT }),
  {
    ariaLabel: 'Break-even prefix length as reuse grows',
  },
)

export default function CacheBreakevenChart({ title, caption }: Props) {
  return (
    <figure className="my-8">
      {title && (
        <figcaption className="mb-4 text-[var(--foreground)]">
          <strong className="font-sans text-lg">{title}</strong>
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
            Cheaper to cache (above the line)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--brick)]" />
            Not worth caching (below the line)
          </span>
        </div>
      </div>
      {caption && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{caption}</p>
      )}
    </figure>
  )
}
